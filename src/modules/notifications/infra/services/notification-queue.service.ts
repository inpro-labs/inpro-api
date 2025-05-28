import { Err, Ok } from '@inpro-labs/core';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueueService implements INotificationQueueService {
  constructor(
    @InjectQueue('notification') private readonly queue: Queue,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationSender: INotificationSenderService,
  ) {}

  async queueNotification(notification: Notification) {
    notification.markAsQueued();

    await this.notificationRepository.save(notification);

    await this.queue.add('notification', notification.toObject(), {
      attempts: 3,
      jobId: notification.id.value(),
    });

    return Ok(undefined);
  }

  async processNotification(notification: Notification) {
    const sendResult = await this.notificationSender.send(notification);

    if (sendResult.isErr()) {
      notification.markAsFailed(sendResult.getErr()!.message);
      await this.notificationRepository.save(notification);

      return Err(sendResult.getErr()!);
    }

    notification.markAsSent();
    await this.notificationRepository.save(notification);

    return Ok(undefined);
  }

  async onFailed(notification: Notification) {
    notification.markAsFailed(notification.get('lastError')!);
    await this.notificationRepository.save(notification);

    return Ok(undefined);
  }

  async onCompleted(notification: Notification) {
    notification.markAsSent();
    await this.notificationRepository.save(notification);

    return Ok(undefined);
  }
}
