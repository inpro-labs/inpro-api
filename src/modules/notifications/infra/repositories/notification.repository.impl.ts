import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Err, ID, Ok, Result } from '@inpro-labs/core';
import { TemplateManagerService } from '../services/template-manager.service';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(
    private readonly mongoose: MongooseGateway,
    private readonly templateManagerService: TemplateManagerService,
  ) {}

  async save(notification: Notification): Promise<Result<Notification>> {
    const { id, template, templateData, ...notificationModel } =
      notification.toObject();

    await this.mongoose.models.Notification.create({
      ...notificationModel,
      template,
      templateData,
      channelData: {
        to: 'teste',
      },
    });

    return Ok(notification);
  }

  async getNotificationTemplate(
    template: string,
  ): Promise<Result<NotificationTemplate>> {
    const templateResult = this.templateManagerService.getTemplate(
      ID.create(template).unwrap(),
    );

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    return Ok(templateResult.unwrap());
  }
}
