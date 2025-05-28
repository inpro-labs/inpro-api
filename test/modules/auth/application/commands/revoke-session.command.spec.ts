import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Err, ID, Ok } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { RevokeSessionHandler } from '@modules/auth/application/commands/session/revoke-session.handler';
import { RevokeSessionInputDTO } from '@modules/auth/application/ports/in/session/revoke-session.port';
import { RevokeSessionCommand } from '@modules/auth/application/commands/session/revoke-session.command';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { RefreshTokenDigest } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';

describe('RevokeSessionHandler', () => {
  let handler: RevokeSessionHandler;
  let sessionRepository: MockProxy<ISessionRepository>;
  let eventPublisher: MockProxy<EventPublisher>;

  beforeAll(async () => {
    sessionRepository = mock<ISessionRepository>();
    eventPublisher = mock<EventPublisher>();

    eventPublisher.mergeObjectContext.mockImplementation((s) => s);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RevokeSessionHandler,
        {
          provide: ISessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get(RevokeSessionHandler);
  });

  const validDto: RevokeSessionInputDTO = {
    sessionId: 'session-123',
  };

  it('should revoke a session and call save + commit', async () => {
    const sessionMock = Session.create({
      id: ID.create('session-123').unwrap(),
      userId: ID.create('user-123').unwrap(),
      device: DEVICE_TYPES.IOS,
      deviceId: 'device-123',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
      refreshTokenDigest: RefreshTokenDigest.create(
        'refresh-token-digest',
      ).unwrap(),
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).unwrap();

    sessionRepository.findById.mockResolvedValue(Ok(sessionMock));

    const command = new RevokeSessionCommand(validDto);
    const session = await handler.execute(command);

    expect(session).toBeInstanceOf(Session);
    expect(session.id.value()).toBe(validDto.sessionId);

    expect(sessionRepository.save).toHaveBeenCalledWith(session);
    expect(sessionRepository.findById).toHaveBeenCalledWith(validDto.sessionId);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledTimes(1);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(session);
    expect(session.get('revokedAt')).toBeDefined();
  });

  it('should throw ApplicationException when session creation fails', async () => {
    sessionRepository.findById.mockImplementation(() =>
      Promise.resolve(
        Err(
          new ApplicationException(
            'Session not found',
            404,
            'SESSION_NOT_FOUND',
          ),
        ),
      ),
    );

    const command = new RevokeSessionCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      ApplicationException,
    );
  });
});
