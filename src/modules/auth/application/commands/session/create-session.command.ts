import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Command } from '@nestjs/cqrs';
import { CreateSessionInputDTO } from '@modules/auth/application/ports/in/session/create-session.port';

export class CreateSessionCommand extends Command<Session> {
  constructor(public readonly dto: CreateSessionInputDTO) {
    super();
  }
}
