import { INotificationSender } from '@modules/notifications/application/ports/out/notification-sender.port';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Job } from 'bullmq';

@Injectable()
@Processor('notification', {
  concurrency: 10,
})
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationSender: INotificationSender,
  ) {
    super();
  }

  async process(job: Job<Notification, any, string>): Promise<any> {
    const notification = job.data;

    await this.notificationSender.send(notification);

    return {
      status: 'sent',
      attempts: notification.get('attempts') + 1,
      sentAt: new Date(),
      lastError: null,
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    const notification = job.data as unknown;

    console.log('update status', notification);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any, any, string>) {
    const notification = job.data as unknown;

    console.log('update status failed', notification);
  }
}
