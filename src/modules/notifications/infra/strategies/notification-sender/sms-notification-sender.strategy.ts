import { Ok, Result } from '@inpro-labs/core';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationSenderStrategy } from '@modules/notifications/domain/services/notification-sender-strategy.service';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

export class SmsNotificationSenderStrategy
  implements NotificationSenderStrategy
{
  supports(channel: NotificationChannel): boolean {
    return channel === NotificationChannel.SMS;
  }

  async send(
    notification: Notification,
    variables: Record<string, unknown>,
  ): Promise<Result<void, Error>> {
    console.log('Sending SMS notification', notification.toObject(), variables);
    return Ok(undefined);
  }
}
