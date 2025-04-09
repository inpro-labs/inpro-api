import { PrismaService } from '@shared/infra/services/prisma.service';
import { UserRepository } from '../../domain/interfaces/repository/user.repository';
import { User } from '@modules/user/domain/aggregates/user.aggregate';
import { UserToModelAdapter } from '../adapters/user-to-model.adapter';
import { Err, Ok, Result } from '@inpro-labs/api-sdk';
import { UserToDomainAdapter } from '../factories/user.factory';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<Result<User>> {
    const userModel = user.toObject(new UserToModelAdapter());

    console.log(userModel);

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
}
