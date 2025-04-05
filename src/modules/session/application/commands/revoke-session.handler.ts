import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from './revoke-session.command';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '@modules/session/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler
  implements ICommandHandler<RevokeSessionCommand>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<Session> {
    const { sessionId } = command;

    const result = await this.sessionRepository.findById(sessionId);

    if (result.isErr()) {
      const error = result.getErr();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error!.message);
    }

    const session = result.unwrap();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.revoke();

    await this.sessionRepository.save(session);

    this.publish.mergeObjectContext(session);

    session.commit();

    return session;
  }
}
