import { CommandBus } from '@nestjs/cqrs';
import { Controller, Post, Res } from '@nestjs/common';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Cookie } from '@shared/nest/decorators/cookie.decorator';
import { RequiredValuePipe } from '@shared/nest/pipes/required-value.pipe';
import { Response } from 'express';
import { EnvService } from '@config/env/env.service';
import { REFRESH_TOKEN_EXPIRATION } from '@shared/constants/refresh-token-expiration';
import { Public } from '@shared/security/jwt/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class RefreshTokenController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly envService: EnvService,
  ) {}

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Generate new access and refresh tokens' })
  @ApiConsumes('application/json')
  @ApiCookieAuth('refreshToken')
  async handler(
    @Cookie('refreshToken', RequiredValuePipe) refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: this.envService.isProduction(),
      maxAge: REFRESH_TOKEN_EXPIRATION,
      sameSite: 'strict',
      path: '/',
    });

    return data;
  }
}
