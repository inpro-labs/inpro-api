import { CreateSessionCommand } from '@modules/session/application/commands/create-session.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SessionToResponseAdapter } from '../adapters/session-to-response.adapter';
import { CreateSessionDto } from '@modules/session/application/dtos/create-session.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { RevokeSessionCommand } from '@modules/session/application/commands/revoke-session.command';
import { RevokeSessionDto } from '@modules/session/application/dtos/revoke-session.dto';
import { ListUserSessionsDto } from '@modules/session/application/dtos/list-user-sessions.dto';
import { ListUserSessionsQuery } from '@modules/session/application/queries/list-user-sessions.query';

@Controller()
export class SessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern('create_session')
  async createSession(@Payload() data: CreateSessionDto) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(data),
    );

    return session.toObject(new SessionToResponseAdapter());
  }

  @MessagePattern('revoke_session')
  async revokeSession(@Payload() data: RevokeSessionDto) {
    const session = await this.commandBus.execute(
      new RevokeSessionCommand(data.sessionId),
    );

    return session.toObject(new SessionToResponseAdapter());
  }

  @MessagePattern('list_user_sessions')
  async listUserSessions(@Payload() data: ListUserSessionsDto) {
    const sessions = await this.queryBus.execute(
      new ListUserSessionsQuery(data.userId),
    );

    return new SessionToResponseAdapter().adaptMany(sessions);
  }
}
