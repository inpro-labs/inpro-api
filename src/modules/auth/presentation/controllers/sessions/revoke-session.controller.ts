import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { RevokeSessionCommand } from '@modules/auth/application/commands/session/revoke-session.command';
import { RevokeSessionInputDTO } from '@modules/auth/application/dtos/session/revoke-session-input.dto';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { RevokeSessionSchema } from '@modules/auth/presentation/schemas/session/revoke-session.schema';
import { SessionToResponseAdapter } from '../../adapters/session-to-response.adapter';

@Controller()
export class RevokeSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('revoke_session')
  async revokeSession(
    @Payload(new ZodValidationPipe(RevokeSessionSchema))
    payload: MicroserviceRequest<RevokeSessionInputDTO>,
  ) {
    const session = await this.commandBus.execute(
      new RevokeSessionCommand(payload.data),
    );

    return MessageResponse.ok(session.toObject(new SessionToResponseAdapter()));
  }
}
