import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok, Result } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { SessionToModelAdapter } from '../adapters/session/session-to-model.adapter';
import { SessionToDomainAdapter } from '../adapters/session/session-to-domain.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionRepositoryImpl implements SessionRepository {
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

  async findActiveSession(
    deviceId: string,
    userId: string,
  ): Promise<Result<Session>> {
    try {
      const sessionModel = await this.prisma.session.findFirst({
        where: {
          deviceId,
          expiresAt: { gt: new Date() },
          revokedAt: null,
          userId,
        },
      });

      if (!sessionModel) {
        return Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        );
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
        return Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        );
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
        return Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        );
      }

      const session = new SessionToDomainAdapter().adaptOne(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findDeviceSession(
    id: string,
    userId: string,
    deviceId: string,
  ): Promise<Result<Session>> {
    try {
      const sessionModel = await this.prisma.session.findUnique({
        where: { id, userId, deviceId },
      });

      if (!sessionModel) {
        return Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        );
      }

      const session = new SessionToDomainAdapter().adaptOne(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findAllByUserId(userId: string): Promise<Result<Session[]>> {
    try {
      const sessionModels = await this.prisma.session.findMany({
        where: { userId },
      });

      if (!sessionModels) {
        return Err(
          new ApplicationException(
            'No sessions found',
            404,
            'NO_SESSIONS_FOUND',
          ),
        );
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
