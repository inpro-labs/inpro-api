import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';

export type NotificationModel = {
  _id: string;
  userId: string;
  channel: {
    type: NotificationChannel;
    data: Record<string, unknown>;
  };
  status: NotificationStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
  lastError: string | null;
  templateId: string;
  templateVariables: Record<string, unknown>;
};
