import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  ObservableResponse,
  ZodValidationPipe,
} from '@inpro-labs/api-sdk';
import { CreateSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { CreateSessionDto } from '@modules/auth/application/dtos/session/create-session.dto';
import { SessionToResponseAdapter } from '../../adapters/session-to-response.adapter';

@Controller()
export class CreateSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_session')
  async createSession(
    @Payload(new ZodValidationPipe(CreateSessionSchema))
    payload: MicroserviceRequest<CreateSessionDto>,
  ) {
    const session = await this.commandBus.execute(
      new CreateSessionCommand(payload.data),
    );

    const sessionViewModel = session.toObject(new SessionToResponseAdapter());

    return ObservableResponse.ok(sessionViewModel);
  }
}
