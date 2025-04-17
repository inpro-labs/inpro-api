import { Module } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
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
import { SessionQueryServiceImpl } from './infra/queries/session-query.impl';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from '@modules/account/account.module';
import { SignInHandler } from './application/commands/auth/sign-in.handler';
import { SignInController } from './presentation/controllers/auth/sign-in.controller';
import { AuthServiceImpl } from './infra/services/auth.service.impl';
import { AuthService } from './application/interfaces/services/auth.service.interface';
import { SessionServiceImpl } from './infra/services/session.service.impl';
import { SessionService } from './application/interfaces/services/session.service.interface';
import { SessionRepositoryImpl } from './infra/repositories/session.repository.impl';
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
      useClass: SessionRepositoryImpl,
    },
    {
      provide: SessionService,
      useClass: SessionServiceImpl,
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
      useClass: SessionQueryServiceImpl,
    },
    {
      provide: AuthService,
      useClass: AuthServiceImpl,
    },
  ],
})
export class AuthModule {}
