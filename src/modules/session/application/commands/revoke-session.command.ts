import { Command } from '@nestjs/cqrs';

export class RevokeSessionCommand extends Command<void> {
  constructor(public readonly sessionId: string) {
    super();
  }
}
