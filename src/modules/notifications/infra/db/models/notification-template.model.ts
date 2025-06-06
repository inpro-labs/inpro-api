import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';
import { JSONSchema7 } from 'json-schema';

export type TemplatePlaceholderModel = {
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

type GenericNotificationTemplateChannelModel = {
  type: NotificationChannel;
  metadata: Record<string, unknown>;
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

export type NotificationTemplateChannelModel =
  | EmailNotificationTemplateChannelModel
  | SmsNotificationTemplateChannelModel
  | GenericNotificationTemplateChannelModel;

export type NotificationTemplateModel = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  channels: NotificationTemplateChannelModel[];
};
