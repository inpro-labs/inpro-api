import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { SessionMapper } from '../mappers/session.mapper';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';
import { SessionModel } from '../models/session.model';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly mongoose: MongooseGateway) {}

  async save(session: Session): Promise<Result<Session>> {
    const sessionModel = SessionMapper.fromDomainToModel(session);

    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findOneAndUpdate(
        { _id: sessionModel._id },
        sessionModel,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    return Ok(session);
  }

  async findActiveSession(
    deviceId: string,
    userId: string,
  ): Promise<Result<Session>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findOne<SessionModel>({
        deviceId,
        expiresAt: { $gt: new Date() },
        revokedAt: null,
        userId,
      }),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    const session = SessionMapper.fromModelToDomain(sessionResult.unwrap()!);

    return Ok(session);
  }

  async findByRefreshToken(refreshToken: string): Promise<Result<Session>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findOne<SessionModel>({
        refreshToken,
      }),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    const session = SessionMapper.fromModelToDomain(sessionResult.unwrap()!);

    return Ok(session);
  }

  async findById(id: string): Promise<Result<Session>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findById<SessionModel>(id),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    const session = SessionMapper.fromModelToDomain(sessionResult.unwrap()!);

    return Ok(session);
  }

  async findDeviceSession(
    _id: string,
    userId: string,
    deviceId: string,
  ): Promise<Result<Session>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findOne<SessionModel>({
        _id,
        userId,
        deviceId,
      }),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    const session = SessionMapper.fromModelToDomain(sessionResult.unwrap()!);

    return Ok(session);
  }

  async findAllByUserId(userId: string): Promise<Result<Session[]>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.find<SessionModel>({
        userId,
      }),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('No sessions found'));
    }

    const sessionModels = sessionResult.unwrap();

    const sessions = sessionModels.map((sessionModel) => {
      return SessionMapper.fromModelToDomain(sessionModel);
    });

    return Ok(sessions);
  }

  async delete(id: string): Promise<Result<void>> {
    const sessionResult = await Result.fromPromise(
      this.mongoose.models.Session.findByIdAndDelete(id),
    );

    if (sessionResult.isErr() || !sessionResult.unwrap()) {
      return Err(new Error('Session not found'));
    }

    return Ok(undefined);
  }
}
