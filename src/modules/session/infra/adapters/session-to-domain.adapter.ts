import { Adapter } from '@sputnik-labs/api-sdk';
import { Session } from '../../domain/aggregates/session.aggregate';
import { SessionModel } from '../../domain/interfaces/session.repository';
import { SessionFactory } from '../factories/session.factory';

export class SessionToDomainAdapter implements Adapter<SessionModel, Session> {
  adaptOne(item: SessionModel): Session {
    const { id, device, userAgent, ip, userId, refreshTokenHash, expiresAt } =
      item;

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
    }).unwrap();
  }

  adaptMany(items: SessionModel[]): Session[] {
    return items.map((item) => this.adaptOne(item));
  }
}
