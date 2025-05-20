import { Module } from '@nestjs/common';
import { SessionCreatedHandler } from '@modules/auth/application/events/session/session-created.handler';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { HashModule } from '@shared/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/session/list-user-sessions.handler';
import { RevokeSessionHandler } from './application/commands/session/revoke-session.handler';
import { CreateSessionController } from './presentation/controllers/sessions/create-session.controller';
import { RetrieveUserSessionsController } from './presentation/controllers/sessions/retrieve-user-sessions.controller';
import { RevokeSessionController } from './presentation/controllers/sessions/revoke-session.controller';
import { SessionRevokedHandler } from './application/events/session/session-revoked.handler';
import { CreateSessionHandler } from './application/commands/session/create-session.handler';
import { AccountModule } from '@modules/account/account.module';
import { SignInHandler } from './application/commands/auth/sign-in.handler';
import { SignInController } from './presentation/controllers/auth/sign-in.controller';
import { ValidateUserCredentialsService } from './application/services/auth/validate-user-credentials.service';
import { GenerateTokensService } from './application/services/auth/generate-tokens.service';
import { GetRefreshTokenSessionService } from './application/services/auth/get-refresh-token-session.service';
import { RetrieveSessionByTokenService } from './application/services/session/retrieve-session-by-token.service';
import { RefreshTokenHandler } from './application/commands/auth/refresh-token.handler';
import { ValidateSessionHandler } from './application/commands/auth/validate-session.handler';
import { EnvModule } from '@config/env/env.module';
import { CustomJwtModule } from '@shared/security/jwt/jwt.module';
import { ValidateSessionController } from './presentation/controllers/auth/validate-session.controller';
import { RefreshTokenController } from './presentation/controllers/auth/refresh-token.controller';
import { SignOutController } from './presentation/controllers/auth/sign-out.controller';
import { SignOutHandler } from './application/commands/auth/sign-out.handler';
import { UpdateSessionRefreshTokenService } from './application/services/auth/update-session-refresh-token.service';
import { EncryptModule } from '@shared/security/encrypt/encrypt.module';
import { listUserSessionsProvider } from './infra/providers/list-user-sessions.provider';
import { SessionRepositoryProvider } from './infra/providers/session-repository.provider';

@Module({
  imports: [
    HashModule,
    EncryptModule,
    AccountModule,
    CustomJwtModule,
    EnvModule,
  ],
  controllers: [
    CreateSessionController,
    RetrieveUserSessionsController,
    RevokeSessionController,
    SignInController,
    ValidateSessionController,
    RefreshTokenController,
    SignOutController,
  ],
  providers: [
    listUserSessionsProvider,
    SessionRepositoryProvider,

    // Gateways
    PrismaGateway,

    // Services
    ValidateUserCredentialsService,
    GenerateTokensService,
    GetRefreshTokenSessionService,
    RetrieveSessionByTokenService,
    UpdateSessionRefreshTokenService,

    // CQRS: Commands & Queries & Events Handlers
    CreateSessionHandler,
    SessionCreatedHandler,
    ListUserSessionsHandler,
    RevokeSessionHandler,
    SessionRevokedHandler,
    SignInHandler,
    RefreshTokenHandler,
    ValidateSessionHandler,
    SignOutHandler,
  ],
})
export class AuthModule {}
