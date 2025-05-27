import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export abstract class INotificationSender {
  abstract send(notification: Notification): Promise<void>;
}
