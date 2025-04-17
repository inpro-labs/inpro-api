import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { ApplicationException } from '@inpro-labs/microservices';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Email } from '@modules/account/domain/value-objects/email.value-object';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const {
      dto: { email, password },
    } = command;

    const userExists = await this.userRepository.findByEmail(email);

    if (userExists.isOk()) {
      throw new ApplicationException(
        'User already exists',
        400,
        'USER_ALREADY_EXISTS',
      );
    }

    const passwordHash = (
      await this.hashService.generateHash(password)
    ).unwrap();
    const emailResult = Email.create(email);

    if (emailResult.isErr()) {
      throw new ApplicationException('Invalid email', 400, 'INVALID_EMAIL');
    }

    const userResult = User.create({
      email: emailResult.unwrap(),
      password: passwordHash,
    });

    if (userResult.isErr()) {
      throw new ApplicationException(
        'Error creating user',
        400,
        'USER_CREATION_ERROR',
      );
    }

    const user = userResult.unwrap();

    await this.userRepository.save(user);

    user.commit();

    return user;
  }
}
