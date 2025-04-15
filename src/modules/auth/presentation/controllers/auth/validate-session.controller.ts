import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { SignInCommand } from '@modules/auth/application/commands/auth/sign-in.command';
import { SignInEventSchema } from '@modules/auth/presentation/schemas/auth/sign-in-event.schema';
import { SignInDTO } from '@modules/auth/application/dtos/auth/sign-in-command.dto';
import { ValidateSessionCommand } from '@modules/auth/application/commands/auth/validate-session.command';

@Controller()
export class ValidateSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('validate_session')
  async validateSession(
    @Payload(new ZodValidationPipe(ValidateSessionEventSchema))
    payload: MicroserviceRequest<ValidateSessionDTO>,
  ) {
    const tokens = await this.commandBus.execute(
      new ValidateSessionCommand(payload.data),
    );

    return MessageResponse.ok(tokens);
  }
}
