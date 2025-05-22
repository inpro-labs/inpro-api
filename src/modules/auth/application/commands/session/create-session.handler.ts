import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './create-session.command';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ApplicationException } from '@inpro-labs/microservices';
import { RefreshTokenDigest } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { ID } from '@inpro-labs/core';
import { CreateSessionOutputDTO } from '@modules/auth/application/dtos/session/create-session-output.dto';
import { IEncryptService } from '@shared/security/encrypt/interfaces/encrypt.service.interface';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand, CreateSessionOutputDTO>
{
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly publish: EventPublisher,
    private readonly encryptService: IEncryptService,
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

    const digest = this.encryptService.generateHmacDigest(
      command.dto.refreshToken,
    );
    const refreshTokenDigest = RefreshTokenDigest.create(
      digest.unwrap(),
    ).unwrap();

    const result = Session.create({
      id: command.dto.id ? ID.create(command.dto.id).unwrap() : undefined,
      device: command.dto.device,
      deviceId: command.dto.deviceId,
      userAgent: command.dto.userAgent,
      ip: command.dto.ip,
      userId: ID.create(command.dto.userId).unwrap(),
      refreshTokenDigest,
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

    const sessionSaved = await this.sessionRepository.save(session);

    if (sessionSaved.isErr()) {
      throw new ApplicationException(
        sessionSaved.getErr()!.message,
        400,
        'SESSION_SAVING_ERROR',
      );
    }

    session.commit();

    return session;
  }
}
