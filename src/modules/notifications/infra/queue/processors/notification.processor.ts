import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationFactory } from '../../factories/notification.factory';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { NotificationQueueData } from '../../services/notification-queue.service';
import { NotificationTemplateFactory } from '../../factories/notification-template.factory';
import { Err, Result } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

@Injectable()
@Processor('notification', {
  concurrency: 10,
})
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationQueueService: INotificationQueueService,
  ) {
    super();
  }

  public makeNotificationFromJob(
    job: Job<NotificationQueueData, any, string>,
  ): Result<Notification, Error> {
    const { notification } = job.data;

    console.log(notification.template.channels[0].placeholders);

    const templateResult = NotificationTemplateFactory.make({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: notification.template.id,
      name: notification.template.name,
      description: notification.template.description,
      channels: notification.template.channels,
      tags: notification.template.tags,
    });

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    const template = templateResult.unwrap();

    return NotificationFactory.make(
      {
        _id: notification.id,
        userId: notification.userId,
        channel: notification.channel,
        channelData: notification.channelData,
        status: notification.status,
        attempts: job.attemptsMade,
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.updatedAt),
        sentAt: notification.sentAt ? new Date(notification.sentAt) : null,
        lastError: job.failedReason ?? notification.lastError ?? null,
        templateVariables: notification.templateVariables,
      },
      template,
    );
  }

  async process(job: Job<NotificationQueueData, any, string>): Promise<any> {
    const notification = this.makeNotificationFromJob(job);
    const templateVariables = job.data.templateVariables;

    if (notification.isErr()) {
      throw notification.getErr()!;
    }

    const result = await this.notificationQueueService.processNotification(
      notification.unwrap(),
      templateVariables,
    );

    if (result.isErr()) {
      throw result.getErr()!;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<NotificationQueueData, any, string>) {
    const notification = this.makeNotificationFromJob(job);

    if (notification.isErr()) {
      console.log('failed', notification.getErr()!.message);
      return;
    }

    console.log('completed', notification.unwrap().id.value());
    await this.notificationQueueService.onCompleted(notification.unwrap());
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<NotificationQueueData, any, string>) {
    const notification = this.makeNotificationFromJob(job);

    if (notification.isErr()) {
      console.log('failed', notification.getErr()!.message);
      return;
    }

    console.log('failed', notification.unwrap().id.value());
    console.log('error', notification.unwrap().get('lastError'));

    await this.notificationQueueService.onFailed(notification.unwrap());
  }
}
