import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationModel } from '../db/models/notification.model';
import { NotificationFactory } from '../factories/notification.factory';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';

export class NotificationMapper {
  static fromModelToDomain(
    notification: NotificationModel,
    template: NotificationTemplate,
  ): Notification {
    const {
      _id,
      userId,
      channel,
      status,
      templateVariables,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      lastError,
    } = notification;

    return NotificationFactory.make(
      {
        _id,
        userId,
        channel,
        status,
        templateVariables,
        attempts,
        createdAt,
        updatedAt,
        sentAt,
        lastError,
      },
      template,
    ).unwrap();
  }

  static fromDomainToModel(item: Notification): NotificationModel {
    const {
      id,
      channel,
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
      status,
      templateVariables: templateVariables ?? {},
      attempts,
      templateId: template.id,
      createdAt,
      updatedAt,
      sentAt: sentAt ?? null,
      lastError: lastError ?? null,
    };
  }
}
