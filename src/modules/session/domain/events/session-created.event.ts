import { EventHandler } from 'rich-domain';
import { Session } from '../aggregate/session.aggregate';
import { EVENTS } from '@shared/constants/events';

export class SessionCreatedEvent extends EventHandler<Session> {
  constructor() {
    super({ eventName: EVENTS.SESSION_CREATED });
  }

  dispatch(session: Session): void {
    session.context().dispatchEvent(EVENTS.SESSION_CREATED, session.toObject());
  }
}
