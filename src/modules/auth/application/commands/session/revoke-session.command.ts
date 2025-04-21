import { Command } from '@nestjs/cqrs';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RevokeSessionInputDTO } from '@modules/auth/application/dtos/session/revoke-session-input.dto';

export class RevokeSessionCommand extends Command<Session> {
  constructor(public readonly dto: RevokeSessionInputDTO) {
    super();
  }
}
