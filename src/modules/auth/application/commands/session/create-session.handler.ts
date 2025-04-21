import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './create-session.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ApplicationException } from '@inpro-labs/microservices';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { ID } from '@inpro-labs/core';
import { CreateSessionOutputDTO } from '@modules/auth/application/dtos/session/create-session-output.dto';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand, CreateSessionOutputDTO>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
    private readonly hashService: HashService,
  ) {}

  async execute(
    command: CreateSessionCommand,
  ): Promise<CreateSessionOutputDTO> {
    const activeSession = await this.sessionRepository.findActiveSession(
      command.dto.deviceId,
      command.dto.userId,
    );

    if (activeSession.isOk()) {
      throw new ApplicationException(
        'This device already has an active session',
        400,
        'SESSION_ALREADY_EXISTS',
      );
    }

    const hash = await this.hashService.generateHash(command.dto.refreshToken);
    const refreshTokenHash = RefreshTokenHash.create(hash.unwrap()).unwrap();
    const result = Session.create({
      id: command.dto.id ? ID.create(command.dto.id).unwrap() : undefined,
      device: command.dto.device,
      deviceId: command.dto.deviceId,
      userAgent: command.dto.userAgent,
      ip: command.dto.ip,
      userId: ID.create(command.dto.userId).unwrap(),
      refreshTokenHash,
      expiresAt:
        command.dto.expiresAt ??
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.isErr()) {
      throw new ApplicationException(
        result.getErr()!.message,
        500,
        'INTERNAL_SERVER_ERROR',
      );
    }

    const session = result.unwrap();

    await this.sessionRepository.save(session);

    this.publish.mergeObjectContext(session);

    session.commit();

    return session;
  }
}
