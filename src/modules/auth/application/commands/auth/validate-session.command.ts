import { Command } from '@nestjs/cqrs';
import { ValidateSessionDTO } from '@modules/auth/application/dtos/auth/validate-session-command.dto';

export class ValidateSessionCommand extends Command<void> {
  constructor(public readonly dto: ValidateSessionDTO) {
    super();
  }
}
