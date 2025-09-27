import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProfileCommand } from '../create-profile.command';
import { IProfileRepository } from '@modules/profile/domain/interfaces/repositories/profile.repository';
import { CreateProfileOutputDTO } from '@modules/profile/application/ports/in/create-profile.port';
import { Err, ID, Ok } from '@inpro-labs/core';
import { Profile } from '@modules/profile/domain/aggregates/profile.aggregate';
import { BusinessException } from '@shared/exceptions/business.exception';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler
  implements ICommandHandler<CreateProfileCommand, CreateProfileOutputDTO>
{
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: CreateProfileCommand,
  ): Promise<CreateProfileOutputDTO> {
    const userId = ID.create(command.dto.userId).unwrap();

    const user = await this.userRepository.findById(userId.value());

    if (user.isErr()) {
      return Err(
        new BusinessException('User not found', 'USER_NOT_FOUND', 404),
      );
    }

    const hasProfile = await this.profileRepository.findByUserId(
      userId.value(),
    );

    if (hasProfile.isOk()) {
      return Err(
        new BusinessException(
          'User already has a profile',
          'PROFILE_ALREADY_EXISTS',
          400,
        ),
      );
    }

    const profile = Profile.create({
      name: command.dto.name,
      about: command.dto.about,
      avatarUrl: command.dto.avatarUrl,
      bannerUrl: command.dto.bannerUrl,
      bio: command.dto.bio,
      location: command.dto.location,
      userName: command.dto.userName,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (profile.isErr()) {
      return Err(
        new BusinessException(
          profile.unwrapErr().message,
          'PROFILE_CREATION_ERROR',
          400,
        ),
      );
    }

    const profileSaved = await this.profileRepository.save(profile.unwrap());

    if (profileSaved.isErr()) {
      return Err(
        new BusinessException(
          'Error saving profile',
          'PROFILE_SAVING_ERROR',
          422,
        ),
      );
    }

    return Ok({ profile: profile.unwrap() });
  }
}
