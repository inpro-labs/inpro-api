import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { INotificationQueueService } from '../ports/out/notification-queue.port';

@Injectable()
@EventsHandler(QueueNotificationEvent)
export class QueueNotificationEventHandler
  implements IEventHandler<QueueNotificationEvent>
{
  constructor(private readonly notificationQueue: INotificationQueueService) {}

  async handle(event: QueueNotificationEvent) {
    const notification = event.notification;

    await this.notificationQueue.queueNotification(notification);
  }
}
