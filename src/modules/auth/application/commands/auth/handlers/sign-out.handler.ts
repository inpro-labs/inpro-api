import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BusinessException } from '@shared/exceptions/business.exception';
import { SignOutCommand } from '../sign-out.command';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { IJwtService } from '@shared/security/jwt/interfaces/jwt.service.interface';

@CommandHandler(SignOutCommand)
export class SignOutHandler implements ICommandHandler<SignOutCommand> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(command: SignOutCommand): Promise<void> {
    const tokenPayloadResult = this.jwtService.verify(command.dto.accessToken);

    if (tokenPayloadResult.isErr()) {
      throw new BusinessException('Invalid token', 'INVALID_TOKEN', 401);
    }

    const tokenPayload = tokenPayloadResult.unwrap();

    const sessionResult = await this.sessionRepository.findById(
      tokenPayload.get('sid'),
    );

    if (sessionResult.isErr()) {
      throw new BusinessException(
        'Session not found',
        'SESSION_NOT_FOUND',
        404,
      );
    }

    const session = sessionResult.unwrap();

    if (session.get('userId').value() !== tokenPayload.get('sub')) {
      throw new BusinessException(
        'User does not own this session',
        'USER_DOES_NOT_OWN_SESSION',
        403,
      );
    }

    await this.sessionRepository.delete(session.id.value());
  }
}
