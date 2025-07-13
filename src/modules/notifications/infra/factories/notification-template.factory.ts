import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { NotificationTemplateModel } from '@modules/notifications/infra/db/models/notification-template.model';
import { ID, Result, Err } from '@inpro-labs/core';
import { Placeholder } from '@modules/notifications/domain/value-objects/placeholder.value-object';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';

import type {
  EmailNotificationTemplateChannel,
  SmsNotificationTemplateChannel,
  NotificationTemplateChannel,
} from '@modules/notifications/domain/entities/notification-template.entity';

export class NotificationTemplateFactory {
  static make(data: NotificationTemplateModel): Result<NotificationTemplate> {
    const { id, name, description, channels: modelChannels, tags } = data;

    const domainChannels: NotificationTemplateChannel[] = [];

    for (const channel of modelChannels) {
      const placeholderVOs: Placeholder[] = [];

      for (const phModel of channel.placeholders) {
        const phResult = Placeholder.create({
          name: phModel.name,
          description: phModel.description,
          sensitivity: phModel.sensitivity,
        });

        if (phResult.isErr()) {
          return Err(phResult.getErr()!);
        }

        placeholderVOs.push(phResult.unwrap());
      }

      if (channel.type === NotificationChannel.EMAIL) {
        const emailMeta = channel.metadata as { subject: string; body: string };

        const emailChannel: EmailNotificationTemplateChannel = {
          type: NotificationChannel.EMAIL,
          metadata: {
            subject: emailMeta.subject,
            body: emailMeta.body,
          },
          schema: channel.schema,
          placeholders: placeholderVOs,
        };

        domainChannels.push(emailChannel);
        continue;
      }

      if (channel.type === NotificationChannel.SMS) {
        const smsMeta = channel.metadata as { message: string };

        const smsChannel: SmsNotificationTemplateChannel = {
          type: NotificationChannel.SMS,
          metadata: {
            message: smsMeta.message,
          },
          schema: channel.schema,
          placeholders: placeholderVOs,
        };

        domainChannels.push(smsChannel);
        continue;
      }

      return Err(new Error('Unsupported channel type'));
    }

    return NotificationTemplate.create({
      id: ID.create(id).unwrap(),
      name,
      description,
      tags,
      channels: domainChannels,
    });
  }
}
