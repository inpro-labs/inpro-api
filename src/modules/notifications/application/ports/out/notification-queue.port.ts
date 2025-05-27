import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export abstract class INotificationQueue {
  abstract sendNotification(notification: Notification): Promise<void>;
}
