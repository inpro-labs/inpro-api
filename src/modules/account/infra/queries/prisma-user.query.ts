import { Err, Ok, Result } from '@inpro-labs/api-sdk';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserToDomainAdapter } from '../factories/user.factory';

@Injectable()
export class PrismaUserQuery {
  constructor(private readonly prisma: PrismaService) {}

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
