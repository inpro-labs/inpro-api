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
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './infra/queue/processors/notification.processor';
import { MailSenderGateway } from '@shared/gateways/mail/mail-sender.gateway';
import { notificationQueueServiceProvider } from './infra/nest/providers/notification-queue.service.provider';
import { notificationSenderServiceProvider } from './infra/nest/providers/notification-sender.service.provider';
import { notificationRepositoryProvider } from './infra/nest/providers/notification.repository.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
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
    NotificationProcessor,
    MailSenderGateway,

    // Providers
    notificationRepositoryProvider,
    notificationQueueServiceProvider,
    notificationSenderServiceProvider,
  ],
  exports: [],
})
export class NotificationModule {}
