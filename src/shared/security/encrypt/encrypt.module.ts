import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { EncryptProvider } from './providers/encrypt.provider';

@Module({
  imports: [EnvModule],
  providers: [EncryptProvider],
  exports: [EncryptProvider],
})
export class EncryptModule {}
