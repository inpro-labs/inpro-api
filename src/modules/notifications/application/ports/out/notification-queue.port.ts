import { Result } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export abstract class INotificationQueueService {
  abstract queueNotification(notification: Notification): Promise<Result>;
  abstract processNotification(notification: Notification): Promise<Result>;
  abstract onFailed(notification: Notification): Promise<Result>;
  abstract onCompleted(notification: Notification): Promise<Result>;
}
