import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserToModelAdapter } from '@modules/account/infra/adapters/user/user-to-model.adapter';
import { Err, Ok, Result } from '@inpro-labs/core';
import { UserToDomainAdapter } from '@modules/account/infra/factories/user.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaGateway) {}

  async save(user: User): Promise<Result<User>> {
    const userModel = user.toObject(new UserToModelAdapter());

    try {
      await this.prisma.user.upsert({
        where: { id: userModel.id },
        update: userModel,
        create: userModel,
      });

      return Ok(user);
    } catch (error) {
      return Err(error);
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return Err(new Error('User not found'));
      }

      const userDomain = new UserToDomainAdapter().adaptOne(user);

      return Ok(userDomain);
    } catch (error) {
      return Err(error);
    }
  }

  async findById(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return Err(new Error('User not found'));
      }

      const userDomain = new UserToDomainAdapter().adaptOne(user);

      return Ok(userDomain);
    } catch (error) {
      return Err(error);
    }
  }
}
