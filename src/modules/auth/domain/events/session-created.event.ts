import { Session } from '../aggregates/session.aggregate';

export class SessionCreatedEvent {
  constructor(public readonly session: Session) {}
}
