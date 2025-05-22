import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { RefreshTokenInputDTO } from '@modules/auth/application/dtos/auth/refresh-token-input.dto';
import { refreshTokenSchema } from '../../schemas/auth/refresh-token.schema';

@Controller()
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('refresh_token')
  async refreshToken(
    @Payload(new ZodValidationPipe(refreshTokenSchema))
    payload: MicroserviceRequest<RefreshTokenInputDTO>,
  ) {
    const tokens = await this.commandBus.execute(
      new RefreshTokenCommand(payload.data.refreshToken),
    );

    return MessageResponse.ok(tokens);
  }
}
