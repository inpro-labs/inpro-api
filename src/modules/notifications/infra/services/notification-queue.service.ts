import { Err, Ok } from '@inpro-labs/core';
import { IdentifiablePlainify } from '@inpro-labs/core/dist/utils/types';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import {
  Notification,
  NotificationProps,
} from '@modules/notifications/domain/aggregates/notification.aggregate';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export type NotificationQueueData = {
  notification: IdentifiablePlainify<NotificationProps>;
  templateVariables: Record<string, unknown>;
};

@Injectable()
export class NotificationQueueService implements INotificationQueueService {
  constructor(
    @InjectQueue('notification') private readonly queue: Queue,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationSender: INotificationSenderService,
  ) {}

  async queueNotification(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ) {
    notification.markAsQueued();

    await this.notificationRepository.save(notification);

    await this.queue.add(
      'notification',
      {
        notification: notification.toObject(),
        templateVariables,
      },
      {
        attempts: 3,
        jobId: notification.id.value(),
        removeOnComplete: true,
        removeOnFail: true,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );

    return Ok(undefined);
  }

  async processNotification(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ) {
    const sendResult = await this.notificationSender.send(
      notification,
      templateVariables,
    );

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
