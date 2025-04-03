import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { Err, Ok, Result } from '@sputnik-labs/api-sdk';
import { PrismaService } from '@shared/services/prisma.service';
import { SessionToModelAdapter } from '../adapters/session-to-model.adapter';
import { SessionToDomainAdapter } from '../adapters/session-to-domain.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: Session): Promise<Result<Session>> {
    const sessionModel = session.toObject(new SessionToModelAdapter());

    try {
      await this.prisma.session.upsert({
        where: { id: sessionModel.id },
        update: sessionModel,
        create: sessionModel,
      });

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findByUserId(userId: string): Promise<Result<Session>> {
    const sessionModel = await this.prisma.session.findFirst({
      where: { userId },
    });

    if (!sessionModel) {
      return Err(new Error('Session not found'));
    }

    const session = new SessionToDomainAdapter().adaptOne(sessionModel);

    return Ok(session);
  }
}
