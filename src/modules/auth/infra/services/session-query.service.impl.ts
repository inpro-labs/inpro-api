import { Injectable } from '@nestjs/common';
import { SessionQueryService } from '@modules/auth/application/interfaces/queries/session-query.service.interface';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { Err, Ok, Result } from '@inpro-labs/core';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { Paginated } from '@inpro-labs/microservices';

@Injectable()
export class SessionQueryServiceImpl implements SessionQueryService {
  constructor(private readonly prismaGateway: PrismaGateway) {}

  async listUserSessions(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>> {
    const {
      data: { userId },
      pagination,
    } = query.dto;

    const sessionsResult = await Result.fromPromise(
      this.prismaGateway.session.findMany({
        where: {
          userId,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: {
          lastRefreshAt: 'desc',
        },
      }),
    );

    if (sessionsResult.isErr()) {
      return Err(sessionsResult.getErr()!);
    }

    const sessions = sessionsResult.unwrap();
    const total = await this.prismaGateway.session.count({
      where: {
        userId,
      },
    });

    const paginatedSessions = {
      data: sessions,
      total,
      page: Math.floor(pagination.skip / pagination.take) + 1,
    } satisfies Paginated<SessionModel>;

    return Ok(paginatedSessions);
  }
}
