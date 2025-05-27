import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationModel } from '../db/models/notification.model';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';

export class NotificationMapper {
  static fromModelToDomain(notification: NotificationModel): Notification {
    const {
      _id,
      userId,
      type,
      status,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      lastError,
      templateName,
      templateData,
    } = notification;

    return SessionFactory.make({
      id: _id,
      userId,
      type: NotificationChannel[type] as NotificationChannel,
      status,
      attempts,
      createdAt,
      updatedAt,
      sentAt,
      lastError,
      templateName,
      templateData,
    }).unwrap();
  }

  static fromDomainToModel(item: Session): SessionModel {
    const {
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenDigest,
      expiresAt,
      createdAt,
      revokedAt,
      updatedAt,
      deviceId,
      lastRefreshAt,
    } = item.toObject();

    return {
      _id: id,
      device,
      userAgent,
      ip,
      userId: userId,
      refreshTokenDigest: refreshTokenDigest.value,
      expiresAt: expiresAt,
      createdAt: createdAt,
      revokedAt: revokedAt ?? null,
      updatedAt: updatedAt,
      deviceId: deviceId,
      lastRefreshAt: lastRefreshAt ?? null,
    };
  }
}
