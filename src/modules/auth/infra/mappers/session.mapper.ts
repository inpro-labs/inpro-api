import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionModel } from '../db/models/session.model';
import { SessionFactory } from '@test/factories/fake-session.factory';

export class SessionMapper {
  static fromModelToDomain(session: SessionModel): Session {
    const {
      _id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenDigest,
      expiresAt,
      deviceId,
    } = session;

    return SessionFactory.make({
      id: _id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenDigest,
      expiresAt,
      createdAt: session.createdAt,
      revokedAt: session.revokedAt ?? undefined,
      updatedAt: session.updatedAt,
      deviceId,
      lastRefreshAt: session.lastRefreshAt ?? undefined,
    }).unwrap();
  }

  static fromDomainToModel(item: Session): SessionModel {
    const {
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenDigest,
      expiresAt,
      createdAt,
      revokedAt,
      updatedAt,
      deviceId,
      lastRefreshAt,
    } = item.toObject();

    return {
      _id: id,
      device,
      userAgent,
      ip,
      userId: userId,
      refreshTokenDigest: refreshTokenDigest.value,
      expiresAt: expiresAt,
      createdAt: createdAt,
      revokedAt: revokedAt ?? null,
      updatedAt: updatedAt,
      deviceId: deviceId,
      lastRefreshAt: lastRefreshAt ?? null,
    };
  }
}
