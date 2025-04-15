import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from './sign-in.command';
import { ApplicationException } from '@inpro-labs/microservices';
import { ID } from '@inpro-labs/core';
import { CreateSessionCommand } from '../session/create-session.command';
import { AuthService } from '@modules/auth/infra/services/auth.service';

@CommandHandler(SignInCommand)
export class SignInHandler
  implements
    ICommandHandler<
      SignInCommand,
      {
        accessToken: string;
        refreshToken: string;
      }
    >
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignInCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
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

    const sessionId = ID.create();
    const { accessToken, refreshToken } = this.authService.generateTokens(
      sessionId.unwrap().value(),
      user,
    );

    const session = await this.commandBus.execute(
      new CreateSessionCommand({
        userId: user.id.value(),
        deviceId: command.dto.deviceId,
        id: sessionId.unwrap().value(),
        refreshToken,
        userAgent: command.dto.userAgent,
        ip: command.dto.ip,
        device: command.dto.device,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresAt: session.get('expiresAt'),
    };
  }
}
