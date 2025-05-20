import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionModel } from '../models/session.model';
import { SessionFactory } from '@test/factories/fake-session.factory';

export class SessionMapper {
  static fromModelToDomain(session: SessionModel): Session {
    const {
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenHash,
      expiresAt,
      deviceId,
    } = session;

    return SessionFactory.make({
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenHash,
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
      refreshTokenHash,
      expiresAt,
      createdAt,
      revokedAt,
      updatedAt,
      deviceId,
      lastRefreshAt,
    } = item.toObject();

    return {
      id,
      device,
      userAgent,
      ip,
      userId: userId,
      refreshTokenHash: refreshTokenHash.value,
      expiresAt: expiresAt,
      createdAt: createdAt,
      revokedAt: revokedAt ?? null,
      updatedAt: updatedAt,
      deviceId: deviceId,
      lastRefreshAt: lastRefreshAt ?? null,
    };
  }
}
