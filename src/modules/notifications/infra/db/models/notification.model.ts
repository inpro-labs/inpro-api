import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { NotificationTemplate } from '@modules/notifications/domain/enums/notification-template.enum';

export type NotificationModel = {
  _id: string;
  userId: string;
  channel: NotificationChannel;
  channelData: Record<string, any>;
  status: NotificationStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
  lastError: string | null;
  template: NotificationTemplate;
  templateData: Record<string, any>;
};
