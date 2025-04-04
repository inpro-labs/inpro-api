import { CreateSessionCommand } from '@modules/session/application/commands/create-session.command';
import { CommandBus } from '@nestjs/cqrs';
import { SessionToResponseAdapter } from '../adapters/session-to-response.adapter';
import { CreateSessionDto } from '@modules/session/application/dtos/create-session.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { RevokeSessionCommand } from '@modules/session/application/commands/revoke-session.command';
import { RevokeSessionDto } from '@modules/session/application/dtos/revoke-session.dto';

@Controller()
export class SessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_session')
  async createSession(@Payload() data: CreateSessionDto) {
    console.log(data);
    const session = await this.commandBus.execute(
      new CreateSessionCommand(data),
    );

    return session.toObject(new SessionToResponseAdapter());
  }

  @MessagePattern('revoke_session')
  async revokeSession(@Payload() data: RevokeSessionDto) {
    await this.commandBus.execute(new RevokeSessionCommand(data.sessionId));
  }
}
