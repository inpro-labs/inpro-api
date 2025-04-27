import { Module } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { SessionCreatedHandler } from '@modules/auth/application/events/session/session-created.handler';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/session/list-user-sessions.handler';
import { RevokeSessionHandler } from './application/commands/session/revoke-session.handler';
import { CreateSessionController } from './presentation/controllers/sessions/create-session.controller';
import { RetrieveUserSessionsController } from './presentation/controllers/sessions/retrieve-user-sessions.controller';
import { RevokeSessionController } from './presentation/controllers/sessions/revoke-session.controller';
import { SessionRevokedHandler } from './application/events/session/session-revoked.handler';
import { CreateSessionHandler } from './application/commands/session/create-session.handler';
import { SessionQueryService } from './application/interfaces/queries/session-query.service.interface';
import { SessionQueryServiceImpl } from './infra/services/session-query.service.impl';
import { AccountModule } from '@modules/account/account.module';
import { SignInHandler } from './application/commands/auth/sign-in.handler';
import { SignInController } from './presentation/controllers/auth/sign-in.controller';
import { ValidateUserCredentialsService } from './application/services/auth/validate-user-credentials.service';
import { GenerateTokensService } from './application/services/auth/generate-tokens.service';
import { GetRefreshTokenSessionService } from './application/services/auth/get-refresh-token-session.service';
import { RetrieveSessionByTokenService } from './application/services/session/retrieve-session-by-token.service';
import { SessionRepositoryImpl } from './infra/repositories/session.repository.impl';
import { RefreshTokenHandler } from './application/commands/auth/refresh-token.handler';
import { ValidateSessionHandler } from './application/commands/auth/validate-session.handler';
import { JwtProvider } from '@shared/infra/providers/jwt.provider';

@Module({
  imports: [HashModule, AccountModule],
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
    PrismaGateway,

    // Services
    ValidateUserCredentialsService,
    GenerateTokensService,
    GetRefreshTokenSessionService,
    RetrieveSessionByTokenService,

    // CQRS: Commands & Queries & Events Handlers
    CreateSessionHandler,
    SessionCreatedHandler,
    ListUserSessionsHandler,
    RevokeSessionHandler,
    SessionRevokedHandler,
    SignInHandler,
    RefreshTokenHandler,
    ValidateSessionHandler,

    // Infra Queries
    {
      provide: SessionQueryService,
      useClass: SessionQueryServiceImpl,
    },
    JwtProvider,
  ],
})
export class AuthModule {}
