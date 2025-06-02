import { join } from 'path';
import { readFileSync } from 'fs';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationTemplate } from '@modules/notifications/domain/enums/notification-template.enum';
import { NotificationTemplateFactory } from '../factories/notification-template.factory';
import { pickPlaceholders } from './placeholders';

export const userCreatedTemplate = NotificationTemplateFactory.make({
  id: NotificationTemplate.USER_CREATED,
  name: 'User Created',
  description: 'User created template',
  tags: ['user', 'account'],
  channels: [
    {
      type: NotificationChannel.EMAIL,
      metadata: {
        subject: 'User Created',
        body: readFileSync(
          join(__dirname, 'sources', 'mail', 'user-created.html'),
          'utf8',
        ),
      },
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
        },
      },
      placeholders: pickPlaceholders('user.name', 'user.email'),
    },
  ],
}).unwrap();
