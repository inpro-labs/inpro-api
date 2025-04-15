import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationException } from '@inpro-labs/microservices';
import { AuthService } from '@modules/auth/infra/services/auth.service';
import { RefreshTokenCommand } from './refresh-token.command';

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

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
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

    const { accessToken, refreshToken } = this.authService.generateTokens(
      session.id.value(),
      user,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
