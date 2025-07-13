import { Result } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';

import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
export type SendNotificationInputDTO = {
  userId: string;
  templateId: string;
  templateVariables: Record<string, any>;
  channel: NotificationChannel;
  channelData: Record<string, any>;
};

export type SendNotificationOutputDTO = Result<Notification, Error>;
