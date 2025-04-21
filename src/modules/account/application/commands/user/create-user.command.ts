import { Command } from '@nestjs/cqrs';
import { CreateUserInputDTO } from '@modules/account/application/dtos/user/create-user-input.dto';
import { User } from '@modules/account/domain/aggregates/user.aggregate';

export class CreateUserCommand extends Command<User> {
  constructor(public readonly dto: CreateUserInputDTO) {
    super();
  }
}
