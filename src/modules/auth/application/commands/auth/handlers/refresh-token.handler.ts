import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BusinessException } from '@shared/exceptions/business.exception';
import { RefreshTokenCommand } from '../refresh-token.command';
import { RefreshTokenOutputDTO } from '@modules/auth/application/ports/in/auth/refresh-token.port';
import { GetRefreshTokenSessionService } from '@modules/auth/application/services/auth/get-refresh-token-session.service';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';
import { UpdateSessionRefreshTokenService } from '@modules/auth/application/services/auth/update-session-refresh-token.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand, RefreshTokenOutputDTO>
{
  constructor(
    private readonly getRefreshTokenSessionService: GetRefreshTokenSessionService,
    private readonly generateTokensService: GenerateTokensService,
    private readonly updateSessionRefreshTokenService: UpdateSessionRefreshTokenService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenOutputDTO> {
    const result = await this.getRefreshTokenSessionService.execute(
      command.refreshToken,
    );

    if (result.isErr()) {
      throw new BusinessException(
        result.getErr()!.message,
        'INVALID_REFRESH_TOKEN',
        401,
      );
    }

    const { session, user } = result.unwrap();

    const tokensResult = this.generateTokensService.execute(
      session.id.value(),
      user,
      session.get('deviceId'),
    );

    if (tokensResult.isErr()) {
      throw new BusinessException(
        'Failed to generate tokens',
        'FAILED_TO_GENERATE_TOKENS',
        500,
      );
    }

    const { accessToken, refreshToken } = tokensResult.unwrap();

    await this.updateSessionRefreshTokenService.execute(session, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // TODO: Get from config
    };
  }
}
