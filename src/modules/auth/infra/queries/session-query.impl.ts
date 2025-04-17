import { Injectable } from '@nestjs/common';
import { SessionQueryService } from '@modules/auth/application/interfaces/queries/session-query.service.interface';
import { SessionModel } from '../models/session.model';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { Err, Ok, Result } from '@inpro-labs/core';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { Paginated } from '@inpro-labs/microservices';

@Injectable()
export class SessionQueryServiceImpl implements SessionQueryService {
  constructor(private readonly prismaService: PrismaService) {}

  async listUserSessions(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>> {
    try {
      const {
        data: { userId },
        pagination,
      } = query.dto;

      const sessions = await this.prismaService.session.findMany({
        where: {
          userId,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: {
          lastRefreshAt: 'desc',
        },
      });

      const paginatedSessions = {
        data: sessions,
        total: sessions.length,
        page: Math.floor(pagination.skip / pagination.take) + 1,
      };

      return Ok(paginatedSessions);
    } catch (error) {
      return Err(error);
    }
  }
}
