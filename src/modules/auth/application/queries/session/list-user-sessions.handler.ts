import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { ApplicationException } from '@inpro-labs/api-sdk';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/auth/domain/repositories/session.repository';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery, Session[]>
{
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(query: ListUserSessionsQuery): Promise<Session[]> {
    const sessions = await this.sessionRepository.findAllByUserId(query.userId);

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
