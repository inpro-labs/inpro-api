import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateSessionCommand } from './validate-session.command';
import { SessionService } from '@modules/auth/infra/services/session.service';
import { ApplicationException } from '@inpro-labs/microservices';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

@CommandHandler(ValidateSessionCommand)
export class ValidateSessionHandler
  implements ICommandHandler<ValidateSessionCommand>
{
  constructor(private readonly sessionService: SessionService) {}

  async execute(command: ValidateSessionCommand): Promise<Session> {
    const sessionResult = await this.sessionService.retrieveTokenSession(
      command.accessToken,
    );

    if (sessionResult.isErr()) {
      throw new ApplicationException(
        sessionResult.getErr()!.message,
        401,
        'INVALID_TOKEN',
      );
    }

    const session = sessionResult.unwrap();

    return session;
  }
}
