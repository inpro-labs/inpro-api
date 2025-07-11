import { Err, ID, Result } from '@inpro-labs/core';
import { NotificationModel } from '../db/models/notification.model';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { NotificationVariables } from '@modules/notifications/domain/value-objects/notification-variables.value-object';
import { Channel } from '@modules/notifications/domain/value-objects/channel.value-object';

export class NotificationFactory {
  static make(
    data: Omit<NotificationModel, 'templateId'>,
    template: NotificationTemplate,
  ): Result<Notification> {
    const { _id } = data;

    const commonProps = {
      id: ID.create(_id).unwrap(),
      userId: ID.create(data.userId).unwrap(),
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      attempts: data.attempts,
      lastError: data.lastError ?? undefined,
      templateVariables: NotificationVariables.create(
        data.templateVariables,
      ).unwrap(),
    };

    switch (data.channel) {
      case NotificationChannel.EMAIL:
        return Notification.create({
          ...commonProps,
          channel: Channel.create({
            type: NotificationChannel.EMAIL,
            data: EmailChannelData.create({
              to: data.channelData.to as string,
            }).unwrap(),
          }).unwrap(),
          template: template,
        });
      case NotificationChannel.SMS:
        return Notification.create({
          ...commonProps,
          channel: Channel.create({
            type: NotificationChannel.SMS,
            data: SmsChannelData.create({
              phone: data.channelData.phone as string,
            }).unwrap(),
          }).unwrap(),
          template: template,
        });
      default:
        return Err(new Error('Invalid notification channel'));
    }
  }
}
