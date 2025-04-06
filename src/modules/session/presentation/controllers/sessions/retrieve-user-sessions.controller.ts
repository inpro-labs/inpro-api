import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { ListUserSessionsDto } from '@modules/session/application/dtos/session/list-user-sessions.dto';
import { ListUserSessionsQuery } from '@modules/session/application/queries/list-user-sessions/list-user-sessions.query';
import {
  MicroserviceRequest,
  ObservableResponse,
  ZodValidationPipe,
} from '@inpro-labs/api-sdk';
import { ListUserSessionsSchema } from '@modules/session/presentation/schemas/list-user-sessions.schema';
import { SessionToResponseAdapter } from '../../adapters/session-to-response.adapter';

@Controller()
export class RetrieveUserSessionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern('list_user_sessions')
  async listUserSessions(
    @Payload(new ZodValidationPipe(ListUserSessionsSchema))
    payload: MicroserviceRequest<ListUserSessionsDto>,
  ) {
    const sessions = await this.queryBus.execute(
      new ListUserSessionsQuery(payload.data.userId),
    );

    return ObservableResponse.ok(
      new SessionToResponseAdapter().adaptMany(sessions),
    );
  }
}
