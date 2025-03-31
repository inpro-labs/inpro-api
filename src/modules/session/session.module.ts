import { Module } from '@nestjs/common';
import { SessionController } from './presentation/controllers/session.controller';
import { SessionRepository } from './domain/interfaces/session.repository';
import { PrismaSessionRepository } from './infra/repository/prisma-session.repository';
import { CreateSessionHandler } from './application/commands/handlers/create-session.handler';
import { SessionCreatedSubscriber } from './application/subscribers/session-created.subscriber';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    CreateSessionHandler,
    SessionCreatedSubscriber,
  ],
})
export class SessionModule {}
