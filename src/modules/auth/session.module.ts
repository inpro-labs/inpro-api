import { Module } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/repositories/session.repository';
import { PrismaSessionRepository } from '@modules/auth/infra/repositories/prisma-session.repository';
import { SessionCreatedHandler } from '@modules/auth/application/events/session/session-created.handler';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/session/list-user-sessions.handler';
import { RevokeSessionHandler } from './application/commands/session/revoke-session.handler';
import { CreateSessionController } from './presentation/controllers/sessions/create-session.controller';
import { RetrieveUserSessionsController } from './presentation/controllers/sessions/retrieve-user-sessions.controller';
import { RevokeSessionController } from './presentation/controllers/sessions/revoke-session.controller';
import { SessionRevokedHandler } from './application/events/session/session-revoked.handler';
import { CreateSessionHandler } from './application/commands/session/create-session.handler';

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
