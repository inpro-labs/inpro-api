import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Command } from '@nestjs/cqrs';
import { CreateSessionDto } from '@modules/session/application/dtos/session/create-session.dto';

export class CreateSessionCommand extends Command<Session> {
  constructor(public readonly dto: CreateSessionDto) {
    super();
  }
}
