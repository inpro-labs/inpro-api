import { Module } from '@nestjs/common';
import { SessionController } from './presentation/controllers/session.controller';
import { SessionRepository } from './domain/interfaces/session.repository';
import { PrismaSessionRepository } from './infra/repository/prisma-session.repository';
import { CreateSessionHandler } from './application/commands/create-session.handler';
import { SessionCreatedHandler } from './application/events/session-created.handler';
import { PrismaService } from '@shared/services/prisma.service';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    CreateSessionHandler,
    SessionCreatedHandler,
    PrismaService,
  ],
})
export class SessionModule {}
