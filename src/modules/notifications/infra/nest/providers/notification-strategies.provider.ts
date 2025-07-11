import { Provider } from '@nestjs/common';
import { SmsNotificationSenderStrategy } from '../../strategies/notification-sender/sms-notification-sender.strategy';
import { EmailNotificationSenderStrategy } from '../../strategies/notification-sender/email-notification-sender.strategy';

export const NOTIFICATION_STRATEGIES = 'NOTIFICATION_STRATEGIES';

export const notificationStrategiesProvider: Provider = {
  provide: NOTIFICATION_STRATEGIES,
  useFactory: (
    email: EmailNotificationSenderStrategy,
    sms: SmsNotificationSenderStrategy,
  ) => [email, sms],
  inject: [EmailNotificationSenderStrategy, SmsNotificationSenderStrategy],
};
