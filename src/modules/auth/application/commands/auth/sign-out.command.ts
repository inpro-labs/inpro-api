import { Command } from '@nestjs/cqrs';
import { SignOutInputDTO } from '@modules/auth/application/ports/in/auth/sign-out.port';

export class SignOutCommand extends Command<void> {
  constructor(public readonly dto: SignOutInputDTO) {
    super();
  }
}
