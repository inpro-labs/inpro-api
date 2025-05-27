import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env/env.schema';
import { EnvModule } from './config/env/env.module';
import { JwtModule } from '@shared/security/jwt/jwt.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@shared/security/jwt/guards/jwt-auth.guard';
import { NotificationModule } from '@modules/notifications/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    EnvModule,
    CqrsModule.forRoot(),
    JwtModule,
    // AccountModule,
    AuthModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
