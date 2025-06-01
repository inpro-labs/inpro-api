import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { BusinessException } from '@shared/exceptions/business.exception';
import { ListUserSessionsOutputDTO } from '@modules/auth/application/ports/in/session/list-user-sessions.port';
import { IListUserSessions } from '../../interfaces/queries/list-user-sessions.query.interface';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery, ListUserSessionsOutputDTO>
{
  constructor(private readonly listUserSessions: IListUserSessions) {}

  async execute(
    query: ListUserSessionsQuery,
  ): Promise<ListUserSessionsOutputDTO> {
    const sessions = await this.listUserSessions.perform(query);

    if (sessions.isErr()) {
      throw new BusinessException(
        'Error retrieving user sessions',
        'RETRIEVE_SESSIONS_ERROR',
        500,
      );
    }

    return sessions.unwrap();
  }
}
