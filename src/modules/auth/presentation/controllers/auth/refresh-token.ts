import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { RefreshTokenEventSchema } from '@modules/auth/presentation/schemas/auth/refresh-token-event.schema';
import { RefreshTokenDTO } from '@modules/auth/application/dtos/auth/refresh-token-command.dto';

@Controller()
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('refresh_token')
  async refreshToken(
    @Payload(new ZodValidationPipe(RefreshTokenEventSchema))
    payload: MicroserviceRequest<RefreshTokenDTO>,
  ) {
    const tokens = await this.commandBus.execute(
      new RefreshTokenCommand(payload.data),
    );

    return MessageResponse.ok(tokens);
  }
}
