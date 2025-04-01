import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '@modules/session/domain/events/session-created.event';
import { Injectable } from '@nestjs/common';
import { SessionToObjectAdapter } from '@modules/session/domain/adapters/session.adapter';

@Injectable()
@EventsHandler(SessionCreatedEvent)
export class SessionCreatedHandler
  implements IEventHandler<SessionCreatedEvent>
{
  handle(event: SessionCreatedEvent) {
    const session = new SessionToObjectAdapter().adaptOne(event.session);

    console.log(session);
  }
}
