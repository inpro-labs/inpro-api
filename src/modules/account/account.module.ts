import { IUserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { CreateUserHandler } from './application/commands/user/handlers/create-user.handler';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { HashModule } from '@shared/security/hash/hash.module';
import { CreateUserController } from './presentation/controllers/user/create-user.controller';
import { UserRepositoryProvider } from './infra/providers/user-repository.provider';
import { Module } from '@nestjs/common';

@Module({
  imports: [HashModule],
  providers: [UserRepositoryProvider, CreateUserHandler, PrismaGateway],
  controllers: [CreateUserController],
  exports: [IUserRepository],
})
export class AccountModule {}
