import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '@modules/auth/domain/events/session-created.event';
import { Injectable } from '@nestjs/common';

@Injectable()
@EventsHandler(SessionCreatedEvent)
export class SessionCreatedHandler
  implements IEventHandler<SessionCreatedEvent>
{
  handle(event: SessionCreatedEvent) {
    const session = event.session.toObject();

    console.log(`Notification sent to ${session.userId}`);
  }
}
