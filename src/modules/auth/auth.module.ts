import { Module } from '@nestjs/common';
import { SessionCreatedHandler } from '@modules/auth/application/events/session/session-created.handler';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { HashModule } from '@shared/security/hash/hash.module';
import { ListUserSessionsHandler } from './application/queries/session/list-user-sessions.handler';
import { RevokeSessionHandler } from '@modules/auth/application/commands/session/handlers/revoke-session.handler';
import { SessionRevokedHandler } from '@modules/auth/application/events/session/session-revoked.handler';
import { CreateSessionHandler } from '@modules/auth/application/commands/session/handlers/create-session.handler';
import { AccountModule } from '@modules/account/account.module';
import { SignInHandler } from '@modules/auth/application/commands/auth/handlers/sign-in.handler';
import { SignInController } from './presentation/controllers/auth/sign-in.controller';
import { ValidateUserCredentialsService } from './application/services/auth/validate-user-credentials.service';
import { GenerateTokensService } from './application/services/auth/generate-tokens.service';
import { GetRefreshTokenSessionService } from './application/services/auth/get-refresh-token-session.service';
import { RetrieveSessionByTokenService } from './application/services/session/retrieve-session-by-token.service';
import { RefreshTokenHandler } from '@modules/auth/application/commands/auth/handlers/refresh-token.handler';
import { ValidateSessionHandler } from '@modules/auth/application/commands/auth/handlers/validate-session.handler';
import { EnvModule } from '@config/env/env.module';
import { JwtModule } from '@shared/security/jwt/jwt.module';
import { SignOutHandler } from '@modules/auth/application/commands/auth/handlers/sign-out.handler';
import { UpdateSessionRefreshTokenService } from './application/services/auth/update-session-refresh-token.service';
import { EncryptModule } from '@shared/security/encrypt/encrypt.module';
import { listUserSessionsProvider } from './infra/nest/providers/list-user-sessions.service.provider';
import { SessionRepositoryProvider } from './infra/nest/providers/session.repository.provider';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { sessionSchema } from './infra/db/schemas/session.schema';
import { RefreshTokenController } from './presentation/controllers/auth/refresh-token.controller';
import { SignOutController } from './presentation/controllers/auth/sign-out.controller';
import { RetrieveUserSessionsController } from './presentation/controllers/sessions/retrieve-user-sessions.controller';
import { RevokeSessionController } from './presentation/controllers/sessions/revoke-session.controller';

@Module({
  imports: [
    HashModule,
    EncryptModule,
    AccountModule,
    JwtModule,
    EnvModule,
    MongooseGateway.withSchemas({
      name: 'Session',
      schema: sessionSchema,
    }),
  ],
  controllers: [
    RetrieveUserSessionsController,
    RevokeSessionController,
    SignInController,
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
  exports: [ValidateSessionHandler],
})
export class AuthModule {}
