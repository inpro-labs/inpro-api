import { Command } from '@nestjs/cqrs';
import { CreateUserDto } from '@modules/auth/application/dtos/user/create-user.dto';
import { User } from '@modules/user/domain/aggregates/user.aggregate';

export class CreateUserCommand extends Command<User> {
  constructor(public readonly dto: CreateUserDto) {
    super();
  }
}
