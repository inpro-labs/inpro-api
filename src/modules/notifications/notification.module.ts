import { Module } from '@nestjs/common';
import { SendNotificationHandler } from './application/commands/handlers/send-notification.handler';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import {
  emailNotificationSchema,
  notificationSchema,
  smsNotificationSchema,
} from './infra/db/schemas/notification.schema';

@Module({
  imports: [
    MongooseGateway.withSchemas({
      name: 'Notification',
      schema: notificationSchema,
      discriminators: [
        {
          name: 'EmailNotification',
          schema: emailNotificationSchema,
        },
        {
          name: 'SmsNotification',
          schema: smsNotificationSchema,
        },
      ],
    }),
  ],
  providers: [SendNotificationHandler],
  exports: [],
})
export class NotificationModule {}
