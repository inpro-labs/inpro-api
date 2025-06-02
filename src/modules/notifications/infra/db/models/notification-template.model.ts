import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';
import { JSONSchema7 } from 'json-schema';

type TemplatePlaceholderModel = {
  name: string;
  description?: string;
  sensitivity: PlaceholderSensitivity;
};

type EmailNotificationTemplateChannelModel = {
  type: NotificationChannel.EMAIL;
  metadata: {
    subject: string;
    body: string;
  };
  schema: JSONSchema7;
  placeholders: TemplatePlaceholderModel[];
};

type SmsNotificationTemplateChannelModel = {
  type: NotificationChannel.SMS;
  metadata: {
    message: string;
  };
  schema: JSONSchema7;
  placeholders: TemplatePlaceholderModel[];
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
