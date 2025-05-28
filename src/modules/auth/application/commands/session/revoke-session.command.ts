import { Command } from '@nestjs/cqrs';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RevokeSessionInputDTO } from '@modules/auth/application/ports/in/session/revoke-session.port';

export class RevokeSessionCommand extends Command<Session> {
  constructor(public readonly dto: RevokeSessionInputDTO) {
    super();
  }
}
