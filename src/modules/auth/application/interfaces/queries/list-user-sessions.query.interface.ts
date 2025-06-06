import { Result } from '@inpro-labs/core';
import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { ListUserSessionsQuery } from '../../queries/session/list-user-sessions.query';
import { Paginated } from '@shared/utils/query-params';

export abstract class IListUserSessions {
  abstract perform(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>>;
}
