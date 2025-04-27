import { Command } from '@nestjs/cqrs';
import { SignOutInputDTO } from '@modules/auth/application/dtos/auth/sign-out-input.dto';

export class SignOutCommand extends Command<void> {
  constructor(public readonly dto: SignOutInputDTO) {
    super();
  }
}
