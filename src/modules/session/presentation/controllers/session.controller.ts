import { CreateSessionCommand } from '@modules/session/application/commands/create-session.command';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SessionToResponseAdapter } from '../adapters/session-to-response.adapter';
import { CreateSessionDto } from '@modules/session/application/dtos/create-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createSession(@Body() body: CreateSessionDto) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(body),
    );

    return session.toObject(new SessionToResponseAdapter());
  }
}
