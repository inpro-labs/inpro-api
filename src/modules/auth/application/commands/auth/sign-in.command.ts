import { Command } from '@nestjs/cqrs';
import { SignInDTO } from '../../dtos/auth/sign-in-command.dto';

export class SignInCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(public readonly dto: SignInDTO) {
    super();
  }
}
