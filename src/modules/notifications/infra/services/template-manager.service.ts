import { Injectable } from '@nestjs/common';
import { userCreatedTemplate } from '../templates/user-created.template';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { Err, Ok, Result } from '@inpro-labs/core';
import { JSONSchema7 } from 'json-schema';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';
import { NotificationTemplateFactory } from '../factories/notification-template.factory';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';

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
  private static templates: TemplateDefinition[] = [userCreatedTemplate];

  getTemplate(id: string): Result<NotificationTemplate, Error> {
    const template = TemplateManagerService.templates.find(
      (template) => template.id === id,
    );

    if (!template) {
      return Err(new Error('Template not found'));
    }

    const templateResult = NotificationTemplateFactory.make({
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags,
      channels: template.channels,
    });

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    return Ok(templateResult.unwrap());
  }
}
