import { Adapter } from '@sputnik-labs/api-sdk';
import { Session } from '../aggregates/session.aggregate';
import { SessionModel } from '../interfaces/session.repository';

export class SessionToObjectAdapter implements Adapter<Session, SessionModel> {
  adaptOne(item: Session): SessionModel {
    const { id, device, userAgent, ip, userId, refreshTokenHash, expiresAt } =
      item.toObject();

    return {
      id: id.value(),
      device,
      userAgent,
      ip,
      userId: userId.value(),
      refreshTokenHash: refreshTokenHash.get('value'),
      expiresAt,
    };
  }

  adaptMany(items: Session[]): SessionModel[] {
    return items.map((item) => this.adaptOne(item));
  }
}
