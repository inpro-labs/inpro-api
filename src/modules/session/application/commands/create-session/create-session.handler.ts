import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './create-session.command';
import { SessionRepository } from '@modules/session/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { ApplicationException, ID } from '@inpro-labs/api-sdk';
import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
    private readonly hashService: HashService,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    const hash = await this.hashService.generateHash('meu hash');
    const refreshTokenHash = RefreshTokenHash.create(hash.unwrap()).unwrap();

    const result = Session.create({
      device: command.dto.device,
      deviceId: command.dto.deviceId,
      userAgent: command.dto.userAgent,
      ip: command.dto.ip,
      userId: ID.create(command.dto.userId).unwrap(),
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
