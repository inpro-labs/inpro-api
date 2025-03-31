import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventSubscribeModule } from '@sputnik-labs/api-sdk';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [CqrsModule.forRoot(), EventSubscribeModule, SessionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
