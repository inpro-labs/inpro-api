import { Module } from '@nestjs/common';
import { HashProvider } from './providers/hash.provider';

@Module({
  providers: [HashProvider],
  exports: [HashProvider],
})
export class HashModule {}
