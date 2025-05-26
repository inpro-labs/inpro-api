import { Command } from '@nestjs/cqrs';
import { RefreshTokenOutputDTO } from '@modules/auth/application/ports/in/auth/refresh-token.port';

export class RefreshTokenCommand extends Command<RefreshTokenOutputDTO> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
