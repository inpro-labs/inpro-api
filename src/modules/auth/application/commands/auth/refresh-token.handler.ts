import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationException } from '@inpro-labs/microservices';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenOutputDTO } from '../../dtos/auth/refresh-token-output.dto';
import { GetRefreshTokenSessionService } from '../../services/auth/get-refresh-token-session.service';
import { GenerateTokensService } from '../../services/auth/generate-tokens.service';
import { UpdateSessionRefreshTokenService } from '../../services/auth/update-session-refresh-token.service';

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
      throw new ApplicationException(
        result.getErr()!.message,
        401,
        'INVALID_REFRESH_TOKEN',
      );
    }

    const { session, user } = result.unwrap();

    const tokensResult = this.generateTokensService.execute(
      session.id.value(),
      user,
      session.get('deviceId'),
    );

    if (tokensResult.isErr()) {
      throw new ApplicationException(
        'Failed to generate tokens',
        500,
        'FAILED_TO_GENERATE_TOKENS',
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
