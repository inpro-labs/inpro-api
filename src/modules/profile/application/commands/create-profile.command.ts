import { Command } from '@nestjs/cqrs';
import {
  CreateProfileInputDTO,
  CreateProfileOutputDTO,
} from '@modules/profile/application/ports/in/create-profile.port';

export class CreateProfileCommand extends Command<CreateProfileOutputDTO> {
  constructor(public readonly dto: CreateProfileInputDTO) {
    super();
  }
}
