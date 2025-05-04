import { Adapter } from '@inpro-labs/core';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionModel } from '@modules/auth/infra/models/session.model';

export class SessionToModelAdapter implements Adapter<Session, SessionModel> {
  adaptOne(item: Session): SessionModel {
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

  adaptMany(items: Session[]): SessionModel[] {
    return items.map((item) => this.adaptOne(item));
  }
}
