import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '@modules/auth/domain/events/session-created.event';
import { Injectable } from '@nestjs/common';
import { SessionRevokedEvent } from '@modules/auth/domain/events/session-revoked.event';

@Injectable()
@EventsHandler(SessionRevokedEvent)
export class SessionRevokedHandler
  implements IEventHandler<SessionRevokedEvent>
{
  handle(event: SessionCreatedEvent) {
    const session = event.session.toObject();

    console.log(`Session revoked for user ${session.userId}`);
  }
}
