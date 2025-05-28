import { Command } from '@nestjs/cqrs';
import {
  ValidateSessionInputDTO,
  ValidateSessionOutputDTO,
} from '@modules/auth/application/ports/in/auth/validate-session.port';

export class ValidateSessionCommand extends Command<ValidateSessionOutputDTO> {
  constructor(public readonly dto: ValidateSessionInputDTO) {
    super();
  }
}
