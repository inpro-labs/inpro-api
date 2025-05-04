import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { UserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { Module } from '@nestjs/common';
import { HashServiceImpl } from '@shared/infra/security/hash/services/hash.service';
import { UserRepositoryImpl } from './infra/repositories/user.repository.impl';
import { CreateUserHandler } from './application/commands/user/create-user.handler';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { CreateUserController } from './presentation/controllers/user/create-user.controller';

@Module({
  imports: [HashModule],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: HashService,
      useClass: HashServiceImpl,
    },
    CreateUserHandler,
    PrismaGateway,
  ],
  controllers: [CreateUserController],
  exports: [UserRepository],
})
export class AccountModule {}
