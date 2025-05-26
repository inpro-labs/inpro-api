import { CommandBus } from '@nestjs/cqrs';
import { Body, Controller, Headers, Ip, Post, Res } from '@nestjs/common';
import { SignInCommand } from '@modules/auth/application/commands/auth/sign-in.command';
import { SignInDTO } from '../../dtos/auth/sign-in.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignInOutputDTO } from '@modules/auth/application/ports/in/auth/sign-in.port';
import { Public } from '@shared/security/jwt/decorators/public.decorator';
import { EnvService } from '@config/env/env.service';
import { Response } from 'express';
import { REFRESH_TOKEN_EXPIRATION } from '@shared/constants/refresh-token-expiration';

@ApiTags('Auth')
@Controller('auth')
export class SignInController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly envService: EnvService,
  ) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in user and create session' })
  @ApiBody({ type: SignInDTO })
  @ApiResponse({
    status: 201,
    description: 'Session created',
  })
  @ApiBadRequestResponse({
    description: 'This device already has an active session',
  })
  @ApiConsumes('application/json')
  async handler(
    @Body()
    signInDTO: SignInDTO,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInOutputDTO> {
    const data = await this.commandBus.execute(
      new SignInCommand({
        ...signInDTO,
        ip,
        userAgent,
      }),
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
