export type NotificationModel = {
  _id: string;
  userId: string;
  channel: string;
  channelData: Record<string, any>;
  status: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
  lastError: string | null;
  template: string;
  templateData: Record<string, any>;
};

export type EmailNotificationModel = NotificationModel & {
  to: string;
  subject: string;
};

export type SmsNotificationModel = NotificationModel & {
  to: string;
};
