import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationModel } from '../db/models/notification.model';
import { NotificationFactory } from '../factories/notification.factory';

export class NotificationMapper {
  static fromModelToDomain(notification: NotificationModel): Notification {
    const {
      _id,
      userId,
      channel,
      channelData,
      status,
      template,
      templateData,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      lastError,
    } = notification;

    return NotificationFactory.make({
      _id,
      userId,
      channel,
      channelData,
      status,
      template,
      templateData,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      lastError,
    }).unwrap();
  }

  static fromDomainToModel(item: Notification): NotificationModel {
    const {
      id,
      channel,
      channelData,
      status,
      template,
      templateData,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      userId,
      lastError,
    } = item.toObject();

    return {
      _id: id,
      userId,
      channel,
      channelData,
      status,
      template,
      templateData: templateData ?? {},
      attempts,
      createdAt,
      updatedAt,
      sentAt: sentAt ?? null,
      lastError: lastError ?? null,
    };
  }
}
