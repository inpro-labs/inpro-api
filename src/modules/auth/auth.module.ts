import { Module } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
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
import { SessionQueryService } from './application/interfaces/queries/session-query.service.interface';
import { PrismaSessionQueryService } from './infra/queries/prisma-session-query.service';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from '@modules/account/account.module';
import { SignInHandler } from './application/commands/auth/sign-in.handler';
import { SignInController } from './presentation/controllers/auth/sign-in.controller';
import { AuthService } from './infra/services/auth.service';

@Module({
  imports: [HashModule, JwtModule, AccountModule],
  controllers: [
    CreateSessionController,
    RetrieveUserSessionsController,
    RevokeSessionController,
    SignInController,
  ],
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    PrismaService,

    // CQRS: Commands & Queries & Events Handlers
    CreateSessionHandler,
    SessionCreatedHandler,
    ListUserSessionsHandler,
    RevokeSessionHandler,
    SessionRevokedHandler,
    SignInHandler,
    // Infra Queries
    {
      provide: SessionQueryService,
      useClass: PrismaSessionQueryService,
    },
    AuthService,
  ],
})
export class AuthModule {}
