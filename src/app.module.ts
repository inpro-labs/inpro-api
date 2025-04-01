import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [CqrsModule.forRoot(), SessionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
