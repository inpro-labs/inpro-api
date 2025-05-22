import { Command } from '@nestjs/cqrs';
import { SignInInputDTO } from '@modules/auth/application/dtos/auth/sign-in-input.dto';
import { SignInOutputDTO } from '@modules/auth/application/dtos/auth/sign-in-output.dto';

export class SignInCommand extends Command<SignInOutputDTO> {
  constructor(public readonly dto: SignInInputDTO) {
    super();
  }
}
