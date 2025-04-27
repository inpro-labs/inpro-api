import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateSessionCommand } from './validate-session.command';
import { ApplicationException } from '@inpro-labs/microservices';
import { ValidateSessionOutputDTO } from '../../dtos/auth/validate-session-ouput';
import { SignOutCommand } from './sign-out.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';

@CommandHandler(SignOutCommand)
export class SignOutHandler implements ICommandHandler<SignOutCommand> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: SignOutCommand): Promise<void> {
    const sessionResult = await this.sessionRepository.findById(
      command.dto.sessionId,
    );

    if (sessionResult.isErr()) {
      throw new ApplicationException(
        'Session not found',
        404,
        'SESSION_NOT_FOUND',
      );
    }

    const session = sessionResult.unwrap();

    if (session.get('userId').value() !== command.dto.userId) {
      throw new ApplicationException(
        'User does not own this session',
        403,
        'USER_DOES_NOT_OWN_SESSION',
      );
    }

    await this.sessionRepository.delete(session.id.value());
  }
}
