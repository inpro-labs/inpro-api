import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplicationException } from '@inpro-labs/microservices';
import { SignOutCommand } from './sign-out.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';

@CommandHandler(SignOutCommand)
export class SignOutHandler implements ICommandHandler<SignOutCommand> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignOutCommand): Promise<void> {
    const tokenPayloadResult = this.jwtService.verify(command.dto.accessToken);

    if (tokenPayloadResult.isErr()) {
      throw new ApplicationException('Invalid token', 401, 'INVALID_TOKEN');
    }

    const tokenPayload = tokenPayloadResult.unwrap();

    const sessionResult = await this.sessionRepository.findById(
      tokenPayload.get('sid'),
    );

    if (sessionResult.isErr()) {
      throw new ApplicationException(
        'Session not found',
        404,
        'SESSION_NOT_FOUND',
      );
    }

    const session = sessionResult.unwrap();

    if (session.get('userId').value() !== tokenPayload.get('sub')) {
      throw new ApplicationException(
        'User does not own this session',
        403,
        'USER_DOES_NOT_OWN_SESSION',
      );
    }

    await this.sessionRepository.delete(session.id.value());
  }
}
