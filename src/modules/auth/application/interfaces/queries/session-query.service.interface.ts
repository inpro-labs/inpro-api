import { Result } from '@inpro-labs/core';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { ListUserSessionsQuery } from '../../queries/session/list-user-sessions.query';
import { Paginated } from '@inpro-labs/microservices';

export abstract class SessionQueryService {
  abstract listUserSessions(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>>;
}
