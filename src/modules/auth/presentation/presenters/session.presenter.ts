import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

import { SessionViewModel } from '../view-model/session.view-model';
import { SessionListViewModel } from '../view-model/session-list.view-model';
import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { Paginated } from '@shared/utils/query-params';

export class SessionPresenter {
  presentSession(session: Session): SessionViewModel {
    const {
      id,
      device,
      userAgent,
      userId,
      expiresAt,
      deviceId,
      revokedAt,
      createdAt,
      updatedAt,
      lastRefreshAt,
      ip,
    } = session.toObject();

    return {
      id,
      device,
      userAgent,
      userId,
      expiresAt,
      deviceId,
      createdAt,
      updatedAt,
      lastRefreshAt: lastRefreshAt ?? null,
      revokedAt: revokedAt ?? null,
      ip,
    };
  }

  presentSessions(
    paginated: Paginated<SessionModel>,
  ): Paginated<SessionListViewModel> {
    return {
      data: paginated.data.map((session) => ({
        id: session._id.toString(),
        device: session.device,
        userId: session.userId,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt ?? null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastRefreshAt: session.lastRefreshAt ?? null,
      })),
      total: paginated.total,
      page: paginated.page,
    };
  }
}
