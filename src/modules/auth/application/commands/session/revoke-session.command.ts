import { Command } from '@nestjs/cqrs';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RevokeSessionDto } from '@modules/auth/application/dtos/session/revoke-session.dto';

export class RevokeSessionCommand extends Command<Session> {
  constructor(public readonly dto: RevokeSessionDto) {
    super();
  }
}
