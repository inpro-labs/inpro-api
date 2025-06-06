import { Err, Ok } from '@inpro-labs/core';
import { PlainAggregate } from '@inpro-labs/core/dist/utils/deep-plain';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { NotificationProps } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationFactory } from '../factories/notification.factory';
import { NotificationTemplateFactory } from '../factories/notification-template.factory';
import { DateAsString } from '@shared/utils/types';

export type NotificationQueueData = {
  notification: DateAsString<PlainAggregate<NotificationProps>>;
  templateVariables: Record<string, unknown>;
};

@Injectable()
export class NotificationQueueService implements INotificationQueueService {
  constructor(
    @InjectQueue('notification') private readonly queue: Queue,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationSender: INotificationSenderService,
  ) {}

  private makeNotification(
    notificationData:
      | DateAsString<PlainAggregate<NotificationProps>>
      | PlainAggregate<NotificationProps>,
  ) {
    const template = NotificationTemplateFactory.make(
      notificationData.template,
    );

    if (template.isErr()) {
      return Err(template.getErr()!);
    }

    const notificationResult = NotificationFactory.make(
      {
        ...notificationData,
        _id: notificationData.id,
        sentAt: notificationData.sentAt ?? null,
        lastError: notificationData.lastError ?? null,
        attempts: notificationData.attempts ?? 0,
        createdAt: new Date(notificationData.createdAt),
        updatedAt: new Date(notificationData.updatedAt),
      },
      template.unwrap(),
    );

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    return notificationResult;
  }

  async queueNotification(
    notificationData: PlainAggregate<NotificationProps>,
    templateVariables: Record<string, unknown>,
  ) {
    const notificationResult = this.makeNotification(notificationData);

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    const notification = notificationResult.unwrap();

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
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
    templateVariables: Record<string, unknown>,
    attempts: number,
    failedReason?: string,
  ) {
    const notificationResult = this.makeNotification({
      ...notificationData,
      lastError: failedReason,
      attempts,
    });

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    const notification = notificationResult.unwrap();

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

  async onFailed(
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
  ) {
    const notificationResult = this.makeNotification(notificationData);

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    const notification = notificationResult.unwrap();

    notification.markAsFailed(notificationData.lastError!);
    await this.notificationRepository.save(notification);

    return Ok(undefined);
  }

  async onCompleted(
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
  ) {
    const notificationResult = this.makeNotification(notificationData);

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    const notification = notificationResult.unwrap();

    notification.markAsSent();
    await this.notificationRepository.save(notification);

    return Ok(undefined);
  }
}
