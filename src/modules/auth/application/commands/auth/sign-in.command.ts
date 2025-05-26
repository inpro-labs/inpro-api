import { Command } from '@nestjs/cqrs';
import {
  SignInInputDTO,
  SignInOutputDTO,
} from '@modules/auth/application/ports/in/auth/sign-in.port';

export class SignInCommand extends Command<SignInOutputDTO> {
  constructor(public readonly dto: SignInInputDTO) {
    super();
  }
}
