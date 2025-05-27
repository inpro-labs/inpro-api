import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';

@Injectable()
@EventsHandler(QueueNotificationEvent)
export class QueueNotificationEventHandler
  implements IEventHandler<QueueNotificationEvent>
{
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async handle(event: QueueNotificationEvent) {
    const notification = event.notification;

    console.log(notification.toObject());

    const template = await this.notificationRepository.getNotificationTemplate(
      notification.get('template'),
    );

    if (template.isErr()) {
      throw new Error('Template not found');
    }

    const content = template
      .unwrap()
      .renderContent(
        notification.get('channel'),
        notification.get('templateData') ?? {},
      );

    if (content.isErr()) {
      throw new Error('Failed to render template');
    }

    console.log(`Notification queued: ${content.unwrap()}`);
  }
}
