import { Module } from '@nestjs/common';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { HashServiceImpl } from './services/hash.service';
@Module({
  providers: [
    {
      provide: HashService,
      useClass: HashServiceImpl,
    },
  ],
  exports: [HashService],
})
export class HashModule {}
