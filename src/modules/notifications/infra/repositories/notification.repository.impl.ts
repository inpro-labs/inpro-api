import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { NotificationMapper } from '../mappers/notification.mapper';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Ok, Result } from '@inpro-labs/core';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly mongoose: MongooseGateway) {}

  async save(notification: Notification): Promise<Result<Notification>> {
    const notificationModel = {};

    await this.mongoose.models.Notification.create(notificationModel);

    return Ok(notification);
  }
}
