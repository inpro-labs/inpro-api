import { Err, ID, Result } from '@inpro-labs/core';
import { NotificationModel } from '../db/models/notification.model';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';

export class NotificationFactory {
  static make(data: NotificationModel): Result<Notification> {
    const { _id } = data;

    const commonProps = {
      id: ID.create(_id).unwrap(),
      userId: ID.create(data.userId).unwrap(),
      status: data.status,
      template: data.template,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      attempts: data.attempts,
      lastError: data.lastError ?? undefined,
    };

    const template = NotificationTemplate.create({
      id: ID.create(data.template!.id).unwrap(),
      name: data.template!.name,
      description: data.template!.description,
      channels: data.template!.channels,
    });

    switch (data.channel) {
      case NotificationChannel.EMAIL:
        return Notification.create({
          ...commonProps,
          channel: NotificationChannel.EMAIL,
          channelData: EmailChannelData.create({
            to: data.channelData.to as string,
          }).unwrap(),
          templateVariables: data.templateVariables,
          template: template.unwrap(),
        });
      case NotificationChannel.SMS:
        return Notification.create({
          ...commonProps,
          channel: NotificationChannel.SMS,
          channelData: SmsChannelData.create({
            phone: data.channelData.phone as string,
          }).unwrap(),
          templateVariables: data.templateVariables,
          template: template.unwrap(),
        });
      default:
        return Err(new Error('Invalid notification channel'));
    }
  }
}
