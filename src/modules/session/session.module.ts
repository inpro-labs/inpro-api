import { Module } from '@nestjs/common';
import { SessionRepository } from './domain/interfaces/repositories/session.repository.interface';
import { PrismaSessionRepository } from './infra/repository/prisma-session.repository';
import { CreateSessionHandler } from './application/commands/create-session/create-session.handler';
import { SessionCreatedHandler } from './application/events/session/session-created.handler';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/list-user-sessions/list-user-sessions.handler';
import { RevokeSessionHandler } from './application/commands/revoke-session/revoke-session.handler';
import { CreateSessionController } from './presentation/controllers/sessions/create-session.controller';
import { RetrieveUserSessionsController } from './presentation/controllers/sessions/retrieve-user-sessions.controller';
import { RevokeSessionController } from './presentation/controllers/sessions/revoke-session.controller';
import { SessionRevokedHandler } from './application/events/session/session-revoked.handler';

@Module({
  imports: [HashModule],
  controllers: [
    CreateSessionController,
    RetrieveUserSessionsController,
    RevokeSessionController,
  ],
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    PrismaService,

    // Commands & Queries & Events Handlers
    CreateSessionHandler,
    SessionCreatedHandler,
    ListUserSessionsHandler,
    RevokeSessionHandler,
    SessionRevokedHandler,
  ],
})
export class SessionModule {}
