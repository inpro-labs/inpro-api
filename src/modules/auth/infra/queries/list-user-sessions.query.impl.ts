import { Injectable } from '@nestjs/common';
import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { Err, Ok, Result } from '@inpro-labs/core';
import { Paginated } from '@inpro-labs/microservices';
import { IListUserSessions } from '@modules/auth/application/interfaces/queries/list-user-sessions.query.interface';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { MongooseGateway } from '@shared/gateways/db/mongoose.gateway';

@Injectable()
export class ListUserSessions implements IListUserSessions {
  constructor(private readonly mongooseGateway: MongooseGateway) {}

  async perform(
    query: ListUserSessionsQuery,
  ): Promise<Result<Paginated<SessionModel>>> {
    const {
      data: { userId },
      pagination,
    } = query.dto;

    const sessionsResult = await Result.fromPromise(
      this.mongooseGateway.models.Session.find<SessionModel>({
        userId,
      })
        .sort({ lastRefreshAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.take),
    );

    if (sessionsResult.isErr()) {
      return Err(sessionsResult.getErr()!);
    }

    const sessions = sessionsResult.unwrap();
    const total = await this.mongooseGateway.models.Session.countDocuments({
      userId,
    });

    const paginatedSessions = {
      data: sessions,
      total,
      page: Math.floor(pagination.skip / pagination.take) + 1,
    } satisfies Paginated<SessionModel>;

    return Ok(paginatedSessions);
  }
}
