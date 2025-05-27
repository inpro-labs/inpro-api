import { join } from 'path';
import { readFileSync } from 'fs';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationTemplate } from '@modules/notifications/domain/enums/notification-template.enum';
import { NotificationTemplateFactory } from '../factories/notification-template.factory';

export const userCreatedTemplate = NotificationTemplateFactory.make({
  id: NotificationTemplate.USER_CREATED,
  name: 'User Created',
  description: 'User created template',
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
      requiredFields: ['userName', 'email'],
    },
  ],
}).unwrap();
