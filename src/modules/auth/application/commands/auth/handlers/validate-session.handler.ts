import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateSessionCommand } from '../validate-session.command';
import { BusinessException } from '@shared/exceptions/business.exception';
import { RetrieveSessionByTokenService } from '@modules/auth/application/services/session/retrieve-session-by-token.service';
import { ValidateSessionOutputDTO } from '@modules/auth/application/ports/in/auth/validate-session.port';

@CommandHandler(ValidateSessionCommand)
export class ValidateSessionHandler
  implements ICommandHandler<ValidateSessionCommand, ValidateSessionOutputDTO>
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
      throw new BusinessException(
        sessionResult.getErr()!.message,
        'INVALID_TOKEN',
        401,
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
