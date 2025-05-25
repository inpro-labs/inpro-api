import { CommandBus } from '@nestjs/cqrs';
import { Body, Controller, Post } from '@nestjs/common';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RefreshTokenDTO } from '../../dtos/auth/refresh-token.dto';

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({ type: RefreshTokenDTO })
  @ApiConsumes('application/json')
  async refreshToken(@Body() dto: RefreshTokenDTO) {
    const data = await this.commandBus.execute(
      new RefreshTokenCommand(dto.refreshToken),
    );

    return data;
  }
}
