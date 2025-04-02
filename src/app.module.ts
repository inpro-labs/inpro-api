import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionModule } from './modules/session/session.module';
import { PrismaService } from './shared/services/prisma.service';

@Module({
  imports: [CqrsModule.forRoot(), SessionModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
