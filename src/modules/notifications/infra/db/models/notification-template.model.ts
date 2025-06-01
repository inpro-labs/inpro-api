import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';

type EmailNotificationTemplateChannelModel = {
  type: NotificationChannel.EMAIL;
  metadata: {
    subject: string;
    body: string;
  };
  requiredFields: string[];
  sensitiveFields: string[];
};

type SmsNotificationTemplateChannelModel = {
  type: NotificationChannel.SMS;
  metadata: {
    message: string;
  };
  requiredFields: string[];
  sensitiveFields: string[];
};

export type NotificationTemplateModel = {
  id: string;
  name: string;
  description: string;
  channels: (
    | EmailNotificationTemplateChannelModel
    | SmsNotificationTemplateChannelModel
  )[];
};
