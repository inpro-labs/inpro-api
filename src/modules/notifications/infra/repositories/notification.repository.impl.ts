import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Err, Ok, Result } from '@inpro-labs/core';
import { TemplateManagerService } from '../services/template-manager.service';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(
    private readonly mongoose: MongooseGateway,
    private readonly templateManagerService: TemplateManagerService,
  ) {}

  async save(notification: Notification): Promise<Result<Notification>> {
    const notificationModel =
      NotificationMapper.fromDomainToModel(notification);

    const notificationResult = await Result.fromPromise(
      this.mongoose.models.Notification.findOneAndUpdate(
        { _id: notificationModel._id },
        notificationModel,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    );

    if (notificationResult.isErr() || !notificationResult.unwrap()) {
      return Err(new Error('Notification not found'));
    }

    return Ok(notification);
  }

  getNotificationTemplate(template: string): Result<NotificationTemplate> {
    const templateResult = this.templateManagerService.getTemplate(template);

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    return Ok(templateResult.unwrap());
  }
}
