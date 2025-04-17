import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationException } from '@inpro-labs/microservices';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenOutputDTO } from '../../dtos/auth/refresh-token-output.dto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements
    ICommandHandler<
      RefreshTokenCommand,
      {
        accessToken: string;
        refreshToken: string;
      }
    >
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenOutputDTO> {
    const result = await this.authService.getRefreshTokenSession(
      command.refreshToken,
    );

    if (result.isErr()) {
      throw new ApplicationException(
        'Invalid credentials',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    const { session, user } = result.unwrap();

    const tokensResult = this.authService.generateTokens(
      session.id.value(),
      user,
    );

    if (tokensResult.isErr()) {
      throw new ApplicationException(
        'Failed to generate tokens',
        500,
        'FAILED_TO_GENERATE_TOKENS',
      );
    }

    const { accessToken, refreshToken } = tokensResult.unwrap();

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // TODO: Get from config
    };
  }
}
