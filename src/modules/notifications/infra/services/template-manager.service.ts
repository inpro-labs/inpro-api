import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { Injectable } from '@nestjs/common';
import { userCreatedTemplate } from '../templates/user-created.template';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { Err, ID, Ok, Result } from '@inpro-labs/core';
import { JSONSchema7 } from 'json-schema';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';

export type TemplatePlaceholderDefinition = {
  name: string;
  description?: string;
  sensitivity: PlaceholderSensitivity;
};

export type TemplateChannelDefinition = {
  type: NotificationChannel;
  schema: JSONSchema7;
  metadata: Record<string, unknown>;
  placeholders: TemplatePlaceholderDefinition[];
};

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  channels: TemplateChannelDefinition[];
};

@Injectable()
export class TemplateManagerService {
  private static templates: NotificationTemplate[] = [userCreatedTemplate];

  getTemplate(id: ID): Result<NotificationTemplate, Error> {
    const template = TemplateManagerService.templates.find((template) =>
      template.id.equals(id),
    );

    if (!template) {
      return Err(new Error('Template not found'));
    }

    return Ok(template);
  }
}
