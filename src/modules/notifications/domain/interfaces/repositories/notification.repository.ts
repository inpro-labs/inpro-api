import { Result } from '@inpro-labs/core';
import { Notification } from '../../aggregates/notification.aggregate';

export abstract class INotificationRepository {
  abstract save(notification: Notification): Promise<Result<Notification>>;
  // abstract findById(id: string): Promise<Notification | null>;
}
