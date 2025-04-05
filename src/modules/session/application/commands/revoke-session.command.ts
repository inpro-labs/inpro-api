import { Command } from '@nestjs/cqrs';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';

export class RevokeSessionCommand extends Command<Session> {
  constructor(public readonly sessionId: string) {
    super();
  }
}
