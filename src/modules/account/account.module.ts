import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { UserRepository } from './domain/repositories/user.repository';
import { Module } from '@nestjs/common';
import { HashServiceImpl } from '@shared/infra/security/hash/services/hash.service';
import { PrismaUserRepository } from './infra/repositories/prisma-user.repository';
import { CreateUserHandler } from './application/commands/user/create-user.handler';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { CreateUserController } from './presentation/controllers/user/create-user.controller';

@Module({
  imports: [HashModule],
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: HashService,
      useClass: HashServiceImpl,
    },
    CreateUserHandler,
    PrismaService,
  ],
  controllers: [CreateUserController],
  exports: [UserRepository],
})
export class AccountModule {}
