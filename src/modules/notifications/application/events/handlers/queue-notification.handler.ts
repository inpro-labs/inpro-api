import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';

@Injectable()
@EventsHandler(QueueNotificationEvent)
export class QueueNotificationEventHandler
  implements IEventHandler<QueueNotificationEvent>
{
  constructor(
    private readonly notificationQueueService: INotificationQueueService,
  ) {}

  async handle(event: QueueNotificationEvent) {
    await this.notificationQueueService.queueNotification(
      event.notification.toObject(),
      event.templateVariables,
    );
  }
}
