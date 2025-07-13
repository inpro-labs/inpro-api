import { Result } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export abstract class INotificationSenderService {
  abstract send(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ): Promise<Result>;
}
