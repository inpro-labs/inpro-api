import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateSessionCommand } from './validate-session.command';
import { SessionService } from '@modules/auth/application/interfaces/services/session.service.interface';
import { ApplicationException } from '@inpro-labs/microservices';

@CommandHandler(ValidateSessionCommand)
export class ValidateSessionHandler
  implements ICommandHandler<ValidateSessionCommand>
{
  constructor(private readonly sessionService: SessionService) {}

  async execute(command: ValidateSessionCommand): Promise<void> {
    const sessionResult = await this.sessionService.retrieveTokenSession(
      command.dto.accessToken,
    );

    if (sessionResult.isErr()) {
      throw new ApplicationException(
        sessionResult.getErr()!.message,
        401,
        'INVALID_TOKEN',
      );
    }
  }
}
