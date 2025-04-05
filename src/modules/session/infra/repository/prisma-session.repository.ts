import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/session/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok, Result } from '@sputnik-labs/api-sdk';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { SessionToModelAdapter } from '../adapters/session-to-model.adapter';
import { SessionToDomainAdapter } from '../adapters/session-to-domain.adapter';
import { Injectable, NotFoundException } from '@nestjs/common';

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
    try {
      const sessionModel = await this.prisma.session.findFirst({
        where: { userId },
      });

      if (!sessionModel) {
        return Err(new Error('Session not found'));
      }

      const session = new SessionToDomainAdapter().adaptOne(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<Result<Session>> {
    try {
      const sessionModel = await this.prisma.session.findFirst({
        where: { refreshTokenHash: refreshToken },
      });

      if (!sessionModel) {
        return Err(new NotFoundException('Session not found'));
      }

      const session = new SessionToDomainAdapter().adaptOne(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findById(id: string): Promise<Result<Session>> {
    try {
      const sessionModel = await this.prisma.session.findUnique({
        where: { id },
      });

      if (!sessionModel) {
        return Err(new NotFoundException('Session not found'));
      }

      const session = new SessionToDomainAdapter().adaptOne(sessionModel);

      return Ok(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return Err(error);
      }

      return Err(error);
    }
  }

  async findAllByUserId(userId: string): Promise<Result<Session[]>> {
    try {
      const sessionModels = await this.prisma.session.findMany({
        where: { userId },
      });

      if (!sessionModels) {
        return Err(new NotFoundException('No sessions found'));
      }

      const sessions = sessionModels.map((sessionModel) => {
        return new SessionToDomainAdapter().adaptOne(sessionModel);
      });

      return Ok(sessions);
    } catch (error) {
      return Err(error);
    }
  }
}
