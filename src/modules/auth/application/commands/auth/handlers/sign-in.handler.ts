import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../sign-in.command';
import { ID } from '@inpro-labs/core';
import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { SignInOutputDTO } from '@modules/auth/application/ports/in/auth/sign-in.port';
import { ValidateUserCredentialsService } from '@modules/auth/application/services/auth/validate-user-credentials.service';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';
import { BusinessException } from '@shared/exceptions/business.exception';

@CommandHandler(SignInCommand)
export class SignInHandler
  implements ICommandHandler<SignInCommand, SignInOutputDTO>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly validateUserCredentialsService: ValidateUserCredentialsService,
    private readonly generateTokensService: GenerateTokensService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInOutputDTO> {
    const userResult = await this.validateUserCredentialsService.execute(
      command.dto.password,
      command.dto.email,
    );

    if (userResult.isErr()) {
      throw new BusinessException(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401,
      );
    }

    const user = userResult.unwrap();

    const sessionId = ID.create().unwrap();

    const tokensResult = this.generateTokensService.execute(
      sessionId.value(),
      user,
      command.dto.deviceId,
    );

    if (tokensResult.isErr()) {
      throw new BusinessException(
        'Failed to generate tokens',
        'FAILED_TO_GENERATE_TOKENS',
        500,
      );
    }

    const { accessToken, refreshToken } = tokensResult.unwrap();

    await this.commandBus.execute(
      new CreateSessionCommand({
        userId: user.id.value(),
        deviceId: command.dto.deviceId,
        id: sessionId.value(),
        refreshToken,
        userAgent: command.dto.userAgent,
        ip: command.dto.ip,
        device: command.dto.device,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // TODO: Get from config
    };
  }
}
