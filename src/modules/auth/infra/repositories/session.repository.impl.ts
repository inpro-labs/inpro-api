import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok, Result } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { Injectable } from '@nestjs/common';
import { SessionMapper } from '../mappers/session.mapper';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { SessionModel } from '../models/session.model';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly mongoose: MongooseGateway) {}

  async save(session: Session): Promise<Result<Session>> {
    const sessionModel = SessionMapper.fromDomainToModel(session);

    try {
      await this.mongoose.models.Session.findOneAndUpdate(
        { _id: sessionModel._id },
        sessionModel,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

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
      const sessionModel =
        await this.mongoose.models.Session.findOne<SessionModel>({
          deviceId,
          expiresAt: { $gt: new Date() },
          revokedAt: null,
          userId,
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

      const session = SessionMapper.fromModelToDomain(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<Result<Session>> {
    try {
      const sessionModel =
        await this.mongoose.models.Session.findOne<SessionModel>({
          refreshToken,
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

      const session = SessionMapper.fromModelToDomain(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findById(id: string): Promise<Result<Session>> {
    try {
      const sessionModel =
        await this.mongoose.models.Session.findById<SessionModel>(id);

      if (!sessionModel) {
        return Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        );
      }

      const session = SessionMapper.fromModelToDomain(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findDeviceSession(
    _id: string,
    userId: string,
    deviceId: string,
  ): Promise<Result<Session>> {
    try {
      const sessionModel =
        await this.mongoose.models.Session.findOne<SessionModel>({
          _id,
          userId,
          deviceId,
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

      const session = SessionMapper.fromModelToDomain(sessionModel);

      return Ok(session);
    } catch (error) {
      return Err(error);
    }
  }

  async findAllByUserId(userId: string): Promise<Result<Session[]>> {
    try {
      const sessionModels =
        await this.mongoose.models.Session.find<SessionModel>({
          userId,
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
        return SessionMapper.fromModelToDomain(sessionModel);
      });

      return Ok(sessions);
    } catch (error) {
      return Err(error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.mongoose.models.Session.findByIdAndDelete(id);

      return Ok(undefined);
    } catch (error) {
      return Err(error);
    }
  }
}
