import { Command } from '@nestjs/cqrs';

export class RefreshSessionCommand extends Command<void> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
