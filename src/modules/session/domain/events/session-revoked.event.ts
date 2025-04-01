import { Session } from '../aggregates/session.aggregate';

export class SessionRevokedEvent {
  constructor(public readonly session: Session) {}
}
