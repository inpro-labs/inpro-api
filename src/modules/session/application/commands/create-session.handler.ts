import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './create-session.command';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { BadRequestException } from '@nestjs/common';
import { ID } from '@sputnik-labs/api-sdk';
import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';
import { hashSync } from 'bcrypt';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    const hash = hashSync('meu hash', 10); // TODO: move to a service
    const refreshTokenHash = RefreshTokenHash.create(hash).unwrap();

    const result = Session.create({
      device: command.dto.device,
      userAgent: command.dto.userAgent,
      ip: command.dto.ip,
      userId: ID.create(command.dto.userId).unwrap(),
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.isErr()) {
      throw new BadRequestException('Failed to create session');
    }

    const session = result.unwrap();

    await this.sessionRepository.save(session);

    this.publish.mergeObjectContext(session);

    session.commit();

    return session;
  }
}
