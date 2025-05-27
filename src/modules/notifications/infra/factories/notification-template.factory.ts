import {
  NotificationTemplate,
  NotificationTemplateChannel,
} from '@modules/notifications/domain/entities/notification-template.entity';
import { NotificationTemplateModel } from '@modules/notifications/infra/db/models/notification-template.model';
import { ID, Result } from '@inpro-labs/core';

export class NotificationTemplateFactory {
  static make(data: NotificationTemplateModel): Result<NotificationTemplate> {
    const { id, name, description, channels } = data;

    return NotificationTemplate.create({
      id: ID.create(id).unwrap(),
      name,
      description,
      channels: channels.map((channel) => ({
        type: channel.type,
        metadata: channel.metadata,
        requiredFields: channel.requiredFields,
      })) as NotificationTemplateChannel[],
    });
  }
}
