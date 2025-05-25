import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EnvModule } from '@config/env/env.module';
import { EnvService } from '@config/env/env.service';
import { JwtProvider } from './providers/jwt.provider';

@Module({
  imports: [
    EnvModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    NestJwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: (env: EnvService) => ({
        secret: env.get('JWT_SECRET'),
      }),
      inject: [EnvService],
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtProvider,
  ],
  exports: [PassportModule, NestJwtModule, JwtProvider],
})
export class JwtModule {}
