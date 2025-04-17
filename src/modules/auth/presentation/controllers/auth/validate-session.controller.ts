import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { ValidateSessionCommand } from '@modules/auth/application/commands/auth/validate-session.command';
import { validateSessionSchema } from '../../schemas/auth/validate-session.schema';
import { z } from 'zod';

@Controller()
export class ValidateSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('validate_session')
  async validateSession(
    @Payload(new ZodValidationPipe(validateSessionSchema))
    payload: MicroserviceRequest<z.infer<typeof validateSessionSchema>>,
  ) {
    const tokens = await this.commandBus.execute(
      new ValidateSessionCommand({
        accessToken: payload.data.accessToken,
      }),
    );

    return MessageResponse.ok(tokens);
  }
}
