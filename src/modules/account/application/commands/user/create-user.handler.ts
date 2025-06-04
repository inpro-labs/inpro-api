import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { IHashService } from '@shared/security/hash/interfaces/hash.service.interface';
import { ApplicationException } from '@inpro-labs/microservices';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Email } from '@modules/account/domain/value-objects/email.value-object';
import { CreateUserOutputDTO } from '@modules/account/application/ports/in/user/create-user.port';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, CreateUserOutputDTO>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserOutputDTO> {
    const {
      dto: { email: emailInput, password },
    } = command;
    const emailResult = Email.create(emailInput);

    if (emailResult.isErr()) {
      throw new ApplicationException('Invalid email', 400, 'INVALID_EMAIL');
    }

    const email = emailResult.unwrap();

    const userExists = await this.userRepository.findByEmail(
      email.get('value'),
    );

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

    const userResult = User.create({
      email,
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

    const userSaved = await this.userRepository.save(user);

    if (userSaved.isErr()) {
      throw new ApplicationException(
        'Error saving user',
        400,
        'USER_SAVING_ERROR',
      );
    }

    user.commit();

    return user;
  }
}
