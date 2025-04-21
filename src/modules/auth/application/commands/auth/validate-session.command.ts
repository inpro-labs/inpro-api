import { Command } from '@nestjs/cqrs';
import { ValidateSessionInputDTO } from '@modules/auth/application/dtos/auth/validate-session-input';
import { ValidateSessionOutputDTO } from '@modules/auth/application/dtos/auth/validate-session-ouput';

export class ValidateSessionCommand extends Command<ValidateSessionOutputDTO> {
  constructor(public readonly dto: ValidateSessionInputDTO) {
    super();
  }
}
