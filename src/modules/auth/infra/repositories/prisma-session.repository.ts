import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/auth/domain/repositories/session.repository.interface';
import { ApplicationException, Err, Ok, Result } from '@inpro-labs/api-sdk';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { SessionToModelAdapter } from '../adapters/session-to-model.adapter';
import { SessionToDomainAdapter } from '../adapters/session-to-domain.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: Session): Promise<Result<Session>> {
    const sessionModel = session.toObject(new SessionToModelAdapter());

    console.log(sessionModel);

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

  async findActiveSessionByDeviceId(
    deviceId: string,
  ): Promise<Result<Session>> {
    try {
      const sessionModel = await this.prisma.session.findFirst({
        where: { deviceId, expiresAt: { gt: new Date() }, revokedAt: null },
      });

      console.log('found', sessionModel);

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
