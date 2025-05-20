import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';

@Injectable()
export class ValidateUserCredentialsService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(password: string, email: string): Promise<Result<User>> {
    const user = await this.userRepository.findByEmail(email);

    if (user.isErr()) {
      return Err(new Error('Invalid credentials'));
    }

    const compareResult = await this.hashService.compareHash(
      password,
      user.unwrap().get('password')!,
    );

    if (!compareResult.unwrap()) {
      return Err(new Error('Invalid credentials'));
    }

    return Ok(user.unwrap());
  }
}
