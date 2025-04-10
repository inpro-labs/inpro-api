import { Command } from '@nestjs/cqrs';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { RevokeSessionDto } from '@modules/session/application/dtos/session/revoke-session.dto';

export class RevokeSessionCommand extends Command<Session> {
  constructor(public readonly dto: RevokeSessionDto) {
    super();
  }
}
