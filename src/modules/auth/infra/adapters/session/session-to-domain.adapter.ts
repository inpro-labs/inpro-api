import { Adapter } from '@inpro-labs/core';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { SessionFactory } from '@modules/auth/infra/factories/session.factory';

export class SessionToDomainAdapter implements Adapter<SessionModel, Session> {
  adaptOne(item: SessionModel): Session {
    const {
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenHash,
      expiresAt,
      deviceId,
    } = item;

    return SessionFactory.make({
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenHash,
      expiresAt,
      createdAt: item.createdAt,
      revokedAt: item.revokedAt ?? null,
      updatedAt: item.updatedAt,
      deviceId,
      lastRefreshAt: item.lastRefreshAt ?? null,
    }).unwrap();
  }

  adaptMany(items: SessionModel[]): Session[] {
    return items.map((item) => this.adaptOne(item));
  }
}
