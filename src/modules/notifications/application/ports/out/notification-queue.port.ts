import { Result } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export abstract class INotificationQueueService {
  abstract queueNotification(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ): Promise<Result>;
  abstract processNotification(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ): Promise<Result>;
  abstract onFailed(notification: Notification): Promise<Result>;
  abstract onCompleted(notification: Notification): Promise<Result>;
}
