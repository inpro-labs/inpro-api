import { Command } from '@nestjs/cqrs';
import { CreateUserInputDTO } from '@modules/account/application/ports/in/user/create-user.port';
import { User } from '@modules/account/domain/aggregates/user.aggregate';

export class CreateUserCommand extends Command<User> {
  constructor(public readonly dto: CreateUserInputDTO) {
    super();
  }
}
