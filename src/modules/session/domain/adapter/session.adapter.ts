import { Adapter } from 'rich-domain';
import { Session } from '../aggregate/session.aggregate';
import { SessionModel } from '../interfaces/session.repository';

export class SessionToObjectAdapter implements Adapter<Session, SessionModel> {
  adaptOne(item: Session): SessionModel {
    const { id, device, userAgent, ip, userId, refreshTokenHash, expiresAt } =
      item.toObject();

    console.log(item.getRaw());

    return {
      id,
      device,
      userAgent,
      ip,
      userId: userId as unknown as string,
      refreshTokenHash: refreshTokenHash.value,
      expiresAt,
    };
  }
}
