import { Err, ID, Result } from '@inpro-labs/core';
import { NotificationModel } from '../db/models/notification.model';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';

export class NotificationFactory {
  static make(data: NotificationModel): Result<Notification> {
    const { _id } = data;

    const commonProps = {
      id: ID.create(_id).unwrap(),
      userId: ID.create(data.userId).unwrap(),
      status: data.status,
      template: data.template,
      templateData: data.templateData,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      attempts: data.attempts,
      lastError: data.lastError ?? undefined,
    };

    switch (data.channel) {
      case NotificationChannel.EMAIL:
        return Notification.create({
          ...commonProps,
          channel: NotificationChannel.EMAIL,
          channelData: EmailChannelData.create({
            to: data.channelData.to as string,
          }).unwrap(),
        });
      case NotificationChannel.SMS:
        return Notification.create({
          ...commonProps,
          channel: NotificationChannel.SMS,
          channelData: SmsChannelData.create({
            phone: data.channelData.phone as string,
          }).unwrap(),
        });
      default:
        return Err(new Error('Invalid notification channel'));
    }
  }
}
