import { Module } from '@nestjs/common';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';
import { EncryptServiceImpl } from './services/encrypt.service';
import { EnvModule } from '@config/env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: EncryptService,
      useClass: EncryptServiceImpl,
    },
  ],
  exports: [EncryptService],
})
export class EncryptModule {}
