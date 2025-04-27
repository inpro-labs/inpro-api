import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { ApplicationException } from '@inpro-labs/microservices';
import { SessionQueryService } from '../../interfaces/queries/session-query.service.interface';
import { ListUserSessionsOutputDTO } from '@modules/auth/application/dtos/session/list-user-sessions-output.dto';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery, ListUserSessionsOutputDTO>
{
  constructor(private readonly sessionQueryService: SessionQueryService) {}

  async execute(
    query: ListUserSessionsQuery,
  ): Promise<ListUserSessionsOutputDTO> {
    const sessions = await this.sessionQueryService.listUserSessions(query);

    if (sessions.isErr()) {
      throw new ApplicationException(
        'Error retrieving user sessions',
        500,
        'RETRIEVE_SESSIONS_ERROR',
      );
    }

    return sessions.unwrap();
  }
}
