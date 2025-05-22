import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateSessionCommand } from './validate-session.command';
import { ApplicationException } from '@inpro-labs/microservices';
import { ValidateSessionOutputDTO } from '../../dtos/auth/validate-session-ouput';
import { RetrieveSessionByTokenService } from '../../services/session/retrieve-session-by-token.service';

@CommandHandler(ValidateSessionCommand)
export class ValidateSessionHandler
  implements ICommandHandler<ValidateSessionCommand>
{
  constructor(
    private readonly retrieveSessionByTokenService: RetrieveSessionByTokenService,
  ) {}

  async execute(
    command: ValidateSessionCommand,
  ): Promise<ValidateSessionOutputDTO> {
    const sessionResult = await this.retrieveSessionByTokenService.execute(
      command.dto.accessToken,
    );

    if (sessionResult.isErr()) {
      throw new ApplicationException(
        sessionResult.getErr()!.message,
        401,
        'INVALID_TOKEN',
      );
    }

    const session = sessionResult.unwrap();

    return {
      isValid: true,
      userId: session.get('userId').value(),
      sessionId: session.id.value(),
      expiresAt: session.get('expiresAt'),
    };
  }
}
