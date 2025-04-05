import { Module } from '@nestjs/common';
import { SessionController } from './presentation/controllers/session.controller';
import { SessionRepository } from './domain/interfaces/repositories/session.repository.interface';
import { PrismaSessionRepository } from './infra/repository/prisma-session.repository';
import { CreateSessionHandler } from './application/commands/create-session.handler';
import { SessionCreatedHandler } from './application/events/session-created.handler';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/list-user-sessions.handler';
import { RevokeSessionHandler } from './application/commands/revoke-session.handler';

@Module({
  imports: [HashModule],
  controllers: [SessionController],
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    CreateSessionHandler,
    SessionCreatedHandler,
    PrismaService,
    ListUserSessionsHandler,
    RevokeSessionHandler,
  ],
})
export class SessionModule {}
