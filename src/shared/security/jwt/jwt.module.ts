import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EnvModule } from '@config/env/env.module';
import { EnvService } from '@config/env/env.service';
import { JwtProvider } from './providers/jwt.provider';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    EnvModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NestJwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: (env: EnvService) => ({
        secret: env.get('JWT_SECRET'),
      }),
      inject: [EnvService],
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [JwtStrategy, JwtProvider],
  exports: [PassportModule, JwtProvider],
})
export class JwtModule {}
