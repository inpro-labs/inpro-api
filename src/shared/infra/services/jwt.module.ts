import { Module } from '@nestjs/common';
import { JwtProvider } from '../providers/jwt.provider';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '@config/env/env.module';

@Module({
  imports: [JwtModule.register({ global: true }), EnvModule],
  providers: [JwtProvider],
  exports: [JwtProvider],
})
export class CustomJwtModule {}
