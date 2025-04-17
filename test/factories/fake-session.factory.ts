import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { ID, Result } from '@inpro-labs/core';

// TODO: Implement optional params

export class SessionFactory {
  static make(id?: string): Result<Session> {
    return Session.create({
      id: id ? ID.create(id).unwrap() : undefined,
      userId: ID.create('user-123').unwrap(),
      refreshTokenHash: RefreshTokenHash.create('refresh-token-hash').unwrap(),
      device: Session.deviceTypes[0],
      deviceId: 'device-id',
      userAgent: 'user-agent',
      ip: 'ip',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      revokedAt: undefined,
    });
  }
}
