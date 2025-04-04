import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from './revoke-session.command';
import { NotFoundException } from '@nestjs/common';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler
  implements ICommandHandler<RevokeSessionCommand>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
    const { sessionId } = command;

    const result = await this.sessionRepository.findByUserId(sessionId);

    if (result.isErr()) {
      throw new NotFoundException('Session not found');
    }

    const session = result.unwrap();

    session.revoke();

    await this.sessionRepository.save(session);

    this.publish.mergeObjectContext(session);

    session.commit();
  }
}
