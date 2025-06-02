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
      templateVariables,
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
      templateVariables,
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
      templateVariables,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      userId,
      lastError,
    } = item.toObject();
    const template = {
      id: item.get('template').id.value(),
      name: item.get('template').get('name'),
      description: item.get('template').get('description'),
      channels: item.get('template').get('channels'),
    };

    return {
      _id: id,
      userId,
      channel,
      channelData,
      status,
      templateVariables: templateVariables ?? {},
      attempts,
      template,
      createdAt,
      updatedAt,
      sentAt: sentAt ?? null,
      lastError: lastError ?? null,
    };
  }
}
