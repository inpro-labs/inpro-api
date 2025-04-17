import { Command } from '@nestjs/cqrs';
import { RefreshTokenOutputDTO } from '@modules/auth/application/dtos/auth/refresh-token-output.dto';

export class RefreshTokenCommand extends Command<RefreshTokenOutputDTO> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
