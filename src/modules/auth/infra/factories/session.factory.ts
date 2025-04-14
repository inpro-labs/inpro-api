import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { Combine, ID, Result } from '@inpro-labs/core';

export class SessionFactory {
  static make(data: SessionModel): Result<Session> {
    const [id, userId, refreshTokenHash] = Combine([
      ID.create(data.id),
      ID.create(data.userId),
      RefreshTokenHash.create(data.refreshTokenHash),
    ]).unwrap();

    return Session.create({
      id,
      userId,
      refreshTokenHash,
      device: data.device,
      deviceId: data.deviceId,
      userAgent: data.userAgent,
      ip: data.ip,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      expiresAt: data.expiresAt,
      revokedAt: data.revokedAt ?? undefined,
    });
  }
}
