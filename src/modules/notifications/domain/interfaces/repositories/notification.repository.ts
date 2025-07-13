import { Result } from '@inpro-labs/core';
import { Notification } from '../../aggregates/notification.aggregate';
import { NotificationTemplate } from '../../entities/notification-template.entity';

export abstract class INotificationRepository {
  abstract save(notification: Notification): Promise<Result<Notification>>;
  abstract getNotificationTemplate(
    template: string,
  ): Result<NotificationTemplate>;
  // abstract findById(id: string): Promise<Notification | null>;
}
