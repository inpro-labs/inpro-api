import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/session/domain/interfaces/repositories/session.repository.interface';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery>
{
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(query: ListUserSessionsQuery): Promise<Session[]> {
    const sessions = await this.sessionRepository.findAllByUserId(query.userId);

    if (sessions.isErr()) {
      throw new NotFoundException('Sessions not found');
    }

    return sessions.unwrap();
  }
}
