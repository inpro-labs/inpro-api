import { Adapter, ID } from '@sputnik-labs/api-sdk';
import { Session } from '../../domain/aggregates/session.aggregate';
import { SessionModel } from '../../domain/interfaces/session.repository';
import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';

export class SessionToDomainAdapter implements Adapter<SessionModel, Session> {
  adaptOne(item: SessionModel): Session {
    const { id, device, userAgent, ip, userId, refreshTokenHash, expiresAt } =
      item;

    const session = Session.create({
      id: ID.create(id).unwrap(),
      device,
      userAgent,
      ip,
      userId: ID.create(userId).unwrap(),
      refreshTokenHash: RefreshTokenHash.create(refreshTokenHash).unwrap(),
      expiresAt,
    });

    return session.expect('Unable to adapt session model to domain');
  }

  adaptMany(items: SessionModel[]): Session[] {
    return items.map((item) => this.adaptOne(item));
  }
}
