import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from './sign-in.command';
import { ApplicationException } from '@inpro-labs/microservices';
import { ID } from '@inpro-labs/core';
import { CreateSessionCommand } from '../session/create-session.command';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';
import { SignInOutputDTO } from '../../dtos/auth/sign-in-output.dto';

@CommandHandler(SignInCommand)
export class SignInHandler
  implements ICommandHandler<SignInCommand, SignInOutputDTO>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInOutputDTO> {
    const userResult = await this.authService.validateUser(
      command.dto.email,
      command.dto.password,
    );

    if (userResult.isErr()) {
      throw new ApplicationException(
        'Invalid credentials',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    const user = userResult.unwrap();

    const sessionId = ID.create().unwrap();

    const tokensResult = this.authService.generateTokens(
      sessionId.value(),
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
