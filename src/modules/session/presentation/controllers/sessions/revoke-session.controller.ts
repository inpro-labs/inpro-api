import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { RevokeSessionCommand } from '@modules/session/application/commands/revoke-session/revoke-session.command';
import { RevokeSessionDto } from '@modules/session/application/dtos/session/revoke-session.dto';
import {
  MicroserviceRequest,
  ObservableResponse,
  ZodValidationPipe,
} from '@inpro-labs/api-sdk';
import { RevokeSessionSchema } from '@modules/session/presentation/schemas/revoke-session.schema';
import { SessionToResponseAdapter } from '../../adapters/session-to-response.adapter';

@Controller()
export class RevokeSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('revoke_session')
  async revokeSession(
    @Payload(new ZodValidationPipe(RevokeSessionSchema))
    payload: MicroserviceRequest<RevokeSessionDto>,
  ) {
    const session = await this.commandBus.execute(
      new RevokeSessionCommand(payload.data),
    );

    return ObservableResponse.ok(
      session.toObject(new SessionToResponseAdapter()),
      200,
    );
  }
}
