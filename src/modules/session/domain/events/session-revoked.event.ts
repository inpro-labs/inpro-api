import { EventHandler } from 'rich-domain';
import { Session } from '../aggregate/session.aggregate';
import { EVENTS } from '@shared/constants/events';

export class SessionRevokedEvent extends EventHandler<Session> {
  constructor() {
    super({ eventName: EVENTS.SESSION_REVOKED });
  }

  dispatch(session: Session): void {
    session.context().dispatchEvent(EVENTS.SESSION_REVOKED, session.toObject());
  }
}
