import { Result } from '@inpro-labs/api-sdk';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { ListUserSessionsQuery } from '../../queries/session/list-user-sessions.query';
import { Paginated } from '@shared/utils/types';

export abstract class SessionQueryService {
  abstract listUserSessions(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>>;
}
