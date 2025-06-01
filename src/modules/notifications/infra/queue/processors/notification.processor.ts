import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationFactory } from '../../factories/notification.factory';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { NotificationQueueData } from '../../services/notification-queue.service';

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

  public makeNotificationFromJob(job: Job<NotificationQueueData, any, string>) {
    const { notification } = job.data;

    return NotificationFactory.make({
      _id: notification.id,
      userId: notification.userId,
      channel: notification.channel,
      channelData: notification.channelData,
      status: notification.status,
      template: {
        id: (notification.template as unknown as { id: string }).id,
        name: notification.template.name,
        description: notification.template.description,
        channels: notification.template.channels,
      },
      attempts: job.attemptsMade,
      createdAt: new Date(notification.createdAt),
      updatedAt: new Date(notification.updatedAt),
      sentAt: notification.sentAt ? new Date(notification.sentAt) : null,
      lastError: job.failedReason ?? notification.lastError ?? null,
      templateVariables: notification.templateVariables,
    }).unwrap();
  }

  async process(job: Job<NotificationQueueData, any, string>): Promise<any> {
    const notification = this.makeNotificationFromJob(job);
    const templateVariables = job.data.templateVariables;

    const result = await this.notificationQueueService.processNotification(
      notification,
      templateVariables,
    );

    if (result.isErr()) {
      throw result.getErr()!;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<NotificationQueueData, any, string>) {
    const notification = this.makeNotificationFromJob(job);
    console.log('completed', notification.id.value());
    await this.notificationQueueService.onCompleted(notification);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<NotificationQueueData, any, string>) {
    const notification = this.makeNotificationFromJob(job);
    console.log('failed', notification.id.value());
    console.log('error', notification.get('lastError'));

    await this.notificationQueueService.onFailed(notification);
  }
}
