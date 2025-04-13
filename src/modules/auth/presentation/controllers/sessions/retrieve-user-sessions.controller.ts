import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { ListUserSessionsDto } from '@modules/auth/application/dtos/session/list-user-sessions.dto';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import {
  MicroserviceRequest,
  ObservableResponse,
  ZodValidationPipe,
} from '@inpro-labs/api-sdk';
import { ListUserSessionsSchema } from '@modules/auth/presentation/schemas/session/list-user-sessions.schema';
import { zodQueryParams } from '@shared/utils/types';

@Controller()
export class RetrieveUserSessionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern('list_user_sessions')
  async listUserSessions(
    @Payload(new ZodValidationPipe(zodQueryParams(ListUserSessionsSchema)))
    payload: MicroserviceRequest<ListUserSessionsDto>,
  ) {
    const sessions = await this.queryBus.execute(
      new ListUserSessionsQuery(payload.data),
    );

    return ObservableResponse.ok(sessions);
  }
}
