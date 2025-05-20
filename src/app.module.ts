import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountModule } from '@modules/account/account.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { envSchema } from './config/env/env.schema';
import { EnvModule } from './config/env/env.module';
import { CustomJwtModule } from '@shared/security/jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    EnvModule,
    CqrsModule.forRoot(),
    JwtModule.register({
      global: true,
    }),
    CustomJwtModule,
    AccountModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
