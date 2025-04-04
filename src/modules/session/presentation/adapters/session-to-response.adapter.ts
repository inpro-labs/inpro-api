import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Adapter } from '@sputnik-labs/api-sdk';
import { SessionViewModel } from '../view-model/session-response.view-model';

export class SessionToResponseAdapter
  implements Adapter<Session, SessionViewModel>
{
  adaptOne(session: Session): SessionViewModel {
    const { id, device, userAgent, ip, userId, refreshTokenHash, expiresAt } =
      session.toObject();

    return {
      id,
      device,
      userAgent,
      ip,
      userId,
      refreshTokenHash: refreshTokenHash.value,
      expiresAt,
    };
  }

  adaptMany(sessions: Session[]): SessionViewModel[] {
    return sessions.map((session) => this.adaptOne(session));
  }
}
