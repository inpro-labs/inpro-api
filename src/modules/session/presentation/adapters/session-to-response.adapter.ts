import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Adapter } from '@inpro-labs/api-sdk';
import { SessionViewModel } from '../view-model/session.view-model';

export class SessionToResponseAdapter
  implements Adapter<Session, SessionViewModel>
{
  adaptOne(session: Session): SessionViewModel {
    const {
      id,
      device,
      userAgent,
      ip,
      userId,
      expiresAt,
      deviceId,
      revokedAt,
    } = session.toObject();

    return {
      id,
      device,
      userAgent,
      ip,
      userId,
      expiresAt,
      deviceId,
      revokedAt: revokedAt ?? null,
    };
  }

  adaptMany(sessions: Session[]): SessionViewModel[] {
    return sessions.map((session) => this.adaptOne(session));
  }
}
