import { join } from 'path';
import { readFileSync } from 'fs';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationTemplate } from '@modules/notifications/domain/enums/notification-template.enum';
import { pickPlaceholders } from './placeholders';
import { TemplateDefinition } from '../services/template-manager.service';

export const userCreatedTemplate: TemplateDefinition = {
  id: NotificationTemplate.USER_CREATED,
  name: 'User Created',
  description: 'User created template',
  tags: ['user', 'account'],
  channels: [
    {
      type: NotificationChannel.EMAIL,
      metadata: {
        subject: 'Hello {{user.name}}',
        body: readFileSync(
          join(__dirname, 'sources', 'mail', 'user-created.html'),
          'utf8',
        ),
      },
      schema: {
        type: 'object',
        required: ['user', 'token'],
        properties: {
          user: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      placeholders: pickPlaceholders('user.name', 'user.email'),
    },
  ],
};
