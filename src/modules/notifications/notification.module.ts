import { Module } from '@nestjs/common';
import { SendNotificationHandler } from './application/commands/handlers/send-notification.handler';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import {
  emailNotificationSchema,
  notificationSchema,
  smsNotificationSchema,
} from './infra/db/schemas/notification.schema';
import { TemplateManagerService } from './infra/services/template-manager.service';
import { SendNotificationController } from './presentation/controllers/send-notification.controller';
import { QueueNotificationEventHandler } from './application/events/queue-notification.event';
import { INotificationRepository } from './domain/interfaces/repositories/notification.repository';
import { NotificationRepositoryImpl } from './infra/repositories/notification.repository.impl';

@Module({
  imports: [
    MongooseGateway.withSchemas({
      name: 'Notification',
      schema: notificationSchema,
      discriminators: [
        {
          name: 'EMAIL',
          schema: emailNotificationSchema,
        },
        {
          name: 'SMS',
          schema: smsNotificationSchema,
        },
      ],
    }),
  ],
  controllers: [SendNotificationController],
  providers: [
    SendNotificationHandler,
    TemplateManagerService,
    QueueNotificationEventHandler,
    {
      provide: INotificationRepository,
      useClass: NotificationRepositoryImpl,
    },
  ],
  exports: [],
})
export class NotificationModule {}
