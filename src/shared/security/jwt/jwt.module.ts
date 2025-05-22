import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '@config/env/env.module';
import { JwtGuard } from './guards/jwt.guard';
import { JwtProvider } from './providers/jwt.provider';

@Module({
  imports: [JwtModule.register({ global: true }), EnvModule],
  providers: [JwtProvider, JwtGuard],
  exports: [JwtProvider, JwtGuard],
})
export class CustomJwtModule {}
