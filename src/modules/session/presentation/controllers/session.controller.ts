import { CreateSessionCommand } from '@modules/session/application/commands/create-session.command';
import { SessionToObjectAdapter } from '@modules/session/domain/adapter/session.adapter';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller('sessions')
export class SessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createSession(@Body() body: Record<string, any>) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(
        body.device,
        body.userAgent,
        body.ip,
        body.userId,
      ),
    );

    return session.toObject(new SessionToObjectAdapter());
  }
}
