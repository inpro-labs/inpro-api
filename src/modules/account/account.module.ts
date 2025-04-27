import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { UserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { Module } from '@nestjs/common';
import { HashServiceImpl } from '@shared/infra/security/hash/services/hash.service';
import { UserRepositoryImpl } from './infra/repositories/user.repository.impl';
import { CreateUserHandler } from './application/commands/user/create-user.handler';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { CreateUserController } from './presentation/controllers/user/create-user.controller';
import { ExistsUserByEmailHandler } from './application/queries/user/exists-user-by-email.handler';
import { SendEmailVerificationHandler } from './application/commands/user/send-email-verification.handler';

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
