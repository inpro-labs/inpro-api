import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../create-user.command';
import { IHashService } from '@shared/security/hash/interfaces/hash.service.interface';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Email } from '@modules/account/domain/value-objects/email.value-object';
import { CreateUserOutputDTO } from '@modules/account/application/ports/in/user/create-user.port';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { BusinessException } from '@shared/exceptions/business.exception';

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
      throw new BusinessException('Invalid email', 'INVALID_EMAIL', 400);
    }

    const email = emailResult.unwrap();

    const userExists = await this.userRepository.findByEmail(
      email.get('value'),
    );

    if (userExists.isOk()) {
      throw new BusinessException(
        'User already exists',
        'USER_ALREADY_EXISTS',
        400,
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
      throw new BusinessException(
        'Error creating user',
        'USER_CREATION_ERROR',
        400,
      );
    }

    const user = userResult.unwrap();

    const userSaved = await this.userRepository.save(user);

    if (userSaved.isErr()) {
      throw new BusinessException(
        'Error saving user',
        'USER_SAVING_ERROR',
        400,
      );
    }

    user.commit();

    return user;
  }
}
