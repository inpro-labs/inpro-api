import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from '../create-session.command';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { Session } from '@modules/session/domain/aggregate/session.aggregate';
import { BadRequestException } from '@nestjs/common';
import { ID } from 'types-ddd';
import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';
import { EVENTS } from '@shared/constants/events';
import { hashSync } from 'bcrypt';
import { unwrapOrThrow } from '@sputnik-labs/api-sdk';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    const hash = hashSync('meu hash', 10);
    const refreshTokenHash = RefreshTokenHash.create(hash).value();

    const session = unwrapOrThrow(
      Session.create({
        device: command.device,
        userAgent: command.userAgent,
        ip: command.ip,
        userId: ID.create(),
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      }),
      new BadRequestException('Failed to create session'),
    );

    await this.sessionRepository.save(session);

    const sessionObject = session.toObject();

    await session.dispatchEvent(EVENTS.SESSION_CREATED, sessionObject);

    return session;
  }
}
