import { model, Schema } from 'mongoose';
import {
  EmailNotificationModel,
  NotificationModel,
  SmsNotificationModel,
} from '../models/notification.model';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';

export const notificationSchema = new Schema<NotificationModel>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID() as string,
    },
    userId: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      required: true,
      enum: Object.values(NotificationChannel),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(NotificationStatus),
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
    templateId: {
      type: String,
      required: true,
      ref: 'notification_templates',
    },
  },
  {
    collection: 'notifications',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    id: false,
    discriminatorKey: 'channel',
  },
);

notificationSchema.index({ userId: 1, channel: 1, status: 1, createdAt: -1 });

export const notificationModel = model<NotificationModel>(
  'Notification',
  notificationSchema,
);

export const emailNotificationSchema = new Schema<EmailNotificationModel>({
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
});

export const smsNotificationSchema = new Schema<SmsNotificationModel>({
  to: {
    type: String,
    required: true,
  },
});
