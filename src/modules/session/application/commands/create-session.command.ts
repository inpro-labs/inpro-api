import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Command } from '@nestjs/cqrs';

export class CreateSessionCommand extends Command<Session> {
  constructor(
    public readonly device: string,
    public readonly userAgent: string,
    public readonly ip: string,
    public readonly userId: string,
  ) {
    super();
  }
}
