import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './create-session.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ApplicationException } from '@inpro-labs/microservices';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { ID } from '@inpro-labs/core';
import { UserRepository } from '@modules/account/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly publish: EventPublisher,
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
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

    const userResult = await this.userRepository.findByEmail(command.dto.email);

    if (userResult.isErr()) {
      throw new ApplicationException('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = userResult.unwrap();

    const payload = {
      sub: user.id,
      email: user.get('email').props.value,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '5m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    const hash = await this.hashService.generateHash(refreshToken);
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
