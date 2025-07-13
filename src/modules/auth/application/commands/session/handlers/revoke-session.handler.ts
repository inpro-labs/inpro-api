import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from '../revoke-session.command';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { RevokeSessionOutputDTO } from '@modules/auth/application/ports/in/session/revoke-session.port';
import { BusinessException } from '@shared/exceptions/business.exception';

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler
  implements ICommandHandler<RevokeSessionCommand, RevokeSessionOutputDTO>
{
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly publish: EventPublisher,
  ) {}

  async execute(
    command: RevokeSessionCommand,
  ): Promise<RevokeSessionOutputDTO> {
    const { dto } = command;

    const result = await this.sessionRepository.findById(dto.sessionId);

    if (result.isErr()) {
      throw result.getErr()!;
    }

    const session = result.unwrap();

    if (session.get('userId').value() !== dto.userId) {
      throw new BusinessException(
        'You are not allowed to revoke this session',
        'SESSION_REVOCATION_NOT_ALLOWED',
        403,
      );
    }

    const revokeResult = session.revoke();

    if (revokeResult.isErr()) {
      throw revokeResult.getErr()!;
    }

    await this.sessionRepository.save(session);

    this.publish.mergeObjectContext(session);

    session.commit();

    return session;
  }
}
