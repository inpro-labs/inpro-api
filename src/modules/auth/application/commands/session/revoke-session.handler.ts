import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from './revoke-session.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { RevokeSessionOutputDTO } from '@modules/auth/application/dtos/session/revoke-session-output.dto';

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler
  implements ICommandHandler<RevokeSessionCommand, RevokeSessionOutputDTO>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
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
