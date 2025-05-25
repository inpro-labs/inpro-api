import { CommandBus } from '@nestjs/cqrs';
import { Controller, Post } from '@nestjs/common';
import { SignOutCommand } from '@modules/auth/application/commands/auth/sign-out.command';
import { AccessToken } from '@shared/nest/decorators/access-token.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class SignOutController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('sign-out')
  @ApiOperation({
    summary: 'Remove user session and revoke refresh token',
  })
  @ApiResponse({ status: 201, description: 'User session removed' })
  @ApiBearerAuth()
  async handler(@AccessToken() accessToken: string) {
    await this.commandBus.execute(
      new SignOutCommand({
        accessToken,
      }),
    );

    return {};
  }
}
