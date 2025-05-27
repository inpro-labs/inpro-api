import { INotificationQueue } from '@modules/notifications/application/ports/out/notification-queue.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueueService implements INotificationQueue {
  constructor(@InjectQueue('notification') private readonly queue: Queue) {}

  async sendNotification(notification: Notification): Promise<void> {
    await this.queue.add('notification', notification.toObject(), {
      attempts: 3,
      jobId: notification.id.value(),
    });
  }
}
