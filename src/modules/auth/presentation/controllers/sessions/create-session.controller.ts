import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { createSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { z } from 'zod';
import { SessionPresenter } from '../../presenters/session.presenter';

@Controller()
export class CreateSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_session')
  async createSession(
    @Payload(new ZodValidationPipe(createSessionSchema))
    payload: MicroserviceRequest<z.infer<typeof createSessionSchema>>,
  ) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(payload.data),
    );

    const presenter = new SessionPresenter();

    const sessionViewModel = presenter.presentSession(session);

    return MessageResponse.ok(sessionViewModel);
  }
}
