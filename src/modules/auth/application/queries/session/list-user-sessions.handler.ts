import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserSessionsQuery } from './list-user-sessions.query';
import { ApplicationException, Result } from '@inpro-labs/api-sdk';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

@QueryHandler(ListUserSessionsQuery)
export class ListUserSessionsHandler
  implements IQueryHandler<ListUserSessionsQuery, Session[]>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: ListUserSessionsQuery): Promise<Session[]> {
    const sessions = await Result.fromPromise(
      this.prismaService.session.findMany({
        where: {
          userId: query.userId,
        },
      }),
    );

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
