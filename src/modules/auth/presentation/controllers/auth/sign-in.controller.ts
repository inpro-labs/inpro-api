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
import { z } from 'zod';

@Controller()
export class SignInController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('sign_in')
  async signIn(
    @Payload(new ZodValidationPipe(SignInEventSchema))
    payload: MicroserviceRequest<z.infer<typeof SignInEventSchema>>,
  ) {
    const tokens = await this.commandBus.execute(
      new SignInCommand(payload.data),
    );

    return MessageResponse.ok(tokens);
  }
}
