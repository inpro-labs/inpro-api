import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationProps } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Job } from 'bullmq';
import { IdentifiablePlainify } from '@inpro-labs/core/dist/utils/types';
import { NotificationFactory } from '../../factories/notification.factory';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';

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
    job: Job<IdentifiablePlainify<NotificationProps>, any, string>,
  ) {
    const notificationProps = job.data;

    return NotificationFactory.make({
      _id: notificationProps.id,
      userId: notificationProps.userId,
      channel: notificationProps.channel,
      channelData: notificationProps.channelData,
      status: notificationProps.status,
      template: notificationProps.template,
      templateData: notificationProps.templateData ?? {},
      attempts: job.attemptsMade,
      createdAt: new Date(notificationProps.createdAt),
      updatedAt: new Date(notificationProps.updatedAt),
      sentAt: notificationProps.sentAt
        ? new Date(notificationProps.sentAt)
        : null,
      lastError: job.failedReason ?? notificationProps.lastError ?? null,
    }).unwrap();
  }

  async process(
    job: Job<IdentifiablePlainify<NotificationProps>, any, string>,
  ): Promise<any> {
    const notification = this.makeNotificationFromJob(job);

    const result =
      await this.notificationQueueService.processNotification(notification);

    if (result.isErr()) {
      throw result.getErr()!;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(
    job: Job<IdentifiablePlainify<NotificationProps>, any, string>,
  ) {
    const notification = this.makeNotificationFromJob(job);
    console.log('completed', notification.id.value());
    await this.notificationQueueService.onCompleted(notification);
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<IdentifiablePlainify<NotificationProps>, any, string>,
  ) {
    const notification = this.makeNotificationFromJob(job);
    console.log('failed', notification.id.value());
    console.log('error', notification.get('lastError'));

    await this.notificationQueueService.onFailed(notification);
  }
}
