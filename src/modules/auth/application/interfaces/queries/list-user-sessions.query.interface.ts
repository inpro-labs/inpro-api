import { Result } from '@inpro-labs/core';
import { Paginated } from '@inpro-labs/microservices';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { ListUserSessionsQuery } from '../../queries/session/list-user-sessions.query';

export abstract class IListUserSessions {
  abstract perform(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>>;
}
