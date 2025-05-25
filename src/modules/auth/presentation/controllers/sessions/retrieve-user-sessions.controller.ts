import { QueryBus } from '@nestjs/cqrs';
import { Controller, Get, Query } from '@nestjs/common';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionPresenter } from '../../presenters/session.presenter';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IPrincipal } from 'src/types/principal';
import { Principal } from '@shared/security/jwt/decorators/principal.decorator';
import { RetrieveUserSessionsQueryDTO } from '../../dtos/session/retrieve-user-sessions.dto';

@Controller('sessions')
export class RetrieveUserSessionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve user sessions' })
  @ApiBearerAuth()
  async listUserSessions(
    @Principal() principal: IPrincipal,
    @Query() query: RetrieveUserSessionsQueryDTO,
  ) {
    const paginated = await this.queryBus.execute(
      new ListUserSessionsQuery({
        data: {
          userId: principal.userId,
        },
        pagination: {
          skip: query.skip,
          take: query.take,
        },
      }),
    );

    const presenter = new SessionPresenter();

    const sessionViewModel = presenter.presentSessions(paginated);

    return sessionViewModel;
  }
}
