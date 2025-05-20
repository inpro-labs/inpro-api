import { IUserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { CreateUserHandler } from './application/commands/user/create-user.handler';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { CreateUserController } from './presentation/controllers/user/create-user.controller';
import { userRepositoryProvider } from './infra/providers/user-repository.provider';
import { Module } from '@nestjs/common';

@Module({
  imports: [HashModule],
  providers: [userRepositoryProvider, CreateUserHandler, PrismaGateway],
  controllers: [CreateUserController],
  exports: [IUserRepository],
})
export class AccountModule {}
