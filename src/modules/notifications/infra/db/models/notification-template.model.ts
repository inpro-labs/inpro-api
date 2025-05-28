import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';

export interface NotificationTemplateModel {
  id: string;
  name: string;
  description: string;
  channels: {
    type: NotificationChannel;
    metadata: {
      subject: string;
      body: string;
    };
    requiredFields: string[];
  }[];
}
