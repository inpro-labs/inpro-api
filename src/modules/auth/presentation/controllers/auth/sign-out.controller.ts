import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { signOutSchema } from '../../schemas/auth/sign-out.schema';
import { SignOutCommand } from '@modules/auth/application/commands/auth/sign-out.command';
import { z } from 'zod';

@Controller()
export class SignOutController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('sign_out')
  async signOut(
    @Payload(new ZodValidationPipe(signOutSchema))
    payload: MicroserviceRequest<z.infer<typeof signOutSchema>>,
  ) {
    await this.commandBus.execute(
      new SignOutCommand({
        sessionId: payload.data.sessionId,
        userId: payload.data.userId,
      }),
    );

    return MessageResponse.ok({});
  }
}
