import { CommandBus } from '@nestjs/cqrs';
import { Controller, Delete, Res } from '@nestjs/common';
import { SignOutCommand } from '@modules/auth/application/commands/auth/sign-out.command';
import { AccessToken } from '@shared/nest/decorators/access-token.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { EnvService } from '@config/env/env.service';

@ApiTags('Auth')
@Controller('auth')
export class SignOutController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly envService: EnvService,
  ) {}

  @Delete('sign-out')
  @ApiOperation({
    summary: 'Remove user session and revoke refresh token',
  })
  @ApiResponse({ status: 201, description: 'User session removed' })
  @ApiBearerAuth()
  async handler(
    @AccessToken() accessToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(
      new SignOutCommand({
        accessToken,
      }),
    );

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.envService.isProduction(),
      sameSite: 'strict',
      path: '/',
    });

    return {};
  }
}
