import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Command } from '@nestjs/cqrs';
import { CreateSessionInputDTO } from '@modules/auth/application/dtos/session/create-session-input.dto';

export class CreateSessionCommand extends Command<Session> {
  constructor(public readonly dto: CreateSessionInputDTO) {
    super();
  }
}
