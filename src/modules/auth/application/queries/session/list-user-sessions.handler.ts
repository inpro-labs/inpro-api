import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { ApplicationException } from '@inpro-labs/api-sdk';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { SessionQueryService } from '../../interfaces/queries/session-query.service.interface';
import { Paginated } from '@shared/utils/types';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery, Paginated<SessionModel>>
{
  constructor(private readonly sessionQueryService: SessionQueryService) {}

  async execute(
    query: ListUserSessionsQuery,
  ): Promise<Paginated<SessionModel>> {
    const sessions = await this.sessionQueryService.listUserSessions(query);

    if (sessions.isErr()) {
      throw new ApplicationException(
        'Erro ao buscar sessões do usuário',
        500,
        'RETRIEVE_SESSIONS_ERROR',
      );
    }

    return sessions.unwrap();
  }
}
