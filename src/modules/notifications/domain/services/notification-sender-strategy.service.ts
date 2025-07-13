import { Result } from '@inpro-labs/core';
import { Notification } from '../aggregates/notification.aggregate';
import { NotificationChannel } from '../enums/notification-channel.enum';

export interface NotificationSenderStrategy {
  supports(channel: NotificationChannel): boolean;
  send(
    notification: Notification,
    variables: Record<string, unknown>,
  ): Promise<Result<void, Error>>;
}
