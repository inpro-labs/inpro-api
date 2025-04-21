import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { CreateSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { SessionToResponseAdapter } from '../../adapters/session-to-response.adapter';
import { z } from 'zod';

@Controller()
export class CreateSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_session')
  async createSession(
    @Payload(new ZodValidationPipe(CreateSessionSchema))
    payload: MicroserviceRequest<z.infer<typeof CreateSessionSchema>>,
  ) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(payload.data),
    );

    const sessionViewModel = session.toObject(new SessionToResponseAdapter());

    return MessageResponse.ok(sessionViewModel);
  }
}
