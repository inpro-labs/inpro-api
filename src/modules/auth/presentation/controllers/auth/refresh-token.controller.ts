import { CommandBus } from '@nestjs/cqrs';
import { Payload } from '@nestjs/microservices';
import { Controller, Post } from '@nestjs/common';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { RefreshTokenInputDTO } from '@modules/auth/application/dtos/auth/refresh-token-input.dto';
import { refreshTokenSchema } from '../../schemas/auth/refresh-token.schema';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
