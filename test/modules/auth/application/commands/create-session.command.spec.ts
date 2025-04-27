import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { CreateSessionHandler } from '@modules/auth/application/commands/session/create-session.handler';
import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { CreateSessionInputDTO } from '@modules/auth/application/dtos/session/create-session-input.dto';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Result } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { SessionFactory } from '@test/factories/fake-session.factory';

describe('CreateSessionHandler', () => {
  let handler: CreateSessionHandler;
  let sessionRepository: MockProxy<SessionRepository>;
  let eventPublisher: MockProxy<EventPublisher>;

  beforeAll(async () => {
    sessionRepository = mock<SessionRepository>();
    eventPublisher = mock<EventPublisher>();

    eventPublisher.mergeObjectContext.mockImplementation((s) => s);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HashModule],
      providers: [
        CreateSessionHandler,
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get(CreateSessionHandler);

    sessionRepository.findActiveSession.mockResolvedValue(
      Result.ok(SessionFactory.make({ id: 'session-123' }).unwrap()),
    );
    sessionRepository.save.mockResolvedValue(
      Result.ok(SessionFactory.make({ id: 'session-123' }).unwrap()),
    );

    sessionRepository.findActiveSession.mockRejectedValue(
      Result.err(
        new ApplicationException('Session not found', 404, 'SESSION_NOT_FOUND'),
      ),
    );
  });

  const validDto: CreateSessionInputDTO = {
    userId: 'user-123',
    device: DEVICE_TYPES.IOS,
    userAgent: 'test-agent',
    ip: '127.0.0.1',
    deviceId: 'test-device-id',
    refreshToken: 'refresh-token',
  };

  it('should create a session and call save + commit', async () => {
    jest
      .spyOn(sessionRepository, 'findActiveSession')
      .mockReturnValueOnce(
        Promise.resolve(
          Result.err(
            new ApplicationException(
              'Session not found',
              404,
              'SESSION_NOT_FOUND',
            ),
          ),
        ),
      );

    const command = new CreateSessionCommand(validDto);
    const session = await handler.execute(command);

    expect(session).toBeInstanceOf(Session);
    expect(session.get('userId').value()).toBe(validDto.userId);

    expect(sessionRepository.save).toHaveBeenCalledWith(session);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledTimes(1);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(session);
  });

  it('should throw ApplicationException when session creation fails', async () => {
    const session = SessionFactory.make();

    jest
      .spyOn(sessionRepository, 'findActiveSession')
      .mockReturnValueOnce(Promise.resolve(Result.ok(session.unwrap())));

    const command = new CreateSessionCommand({
      ...validDto,
      device: 'invalid-device',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      ApplicationException,
    );
  });

  it('should throw ApplicationException when session already exists', async () => {
    jest
      .spyOn(sessionRepository, 'findActiveSession')
      .mockReturnValueOnce(
        Promise.resolve(
          Result.ok(
            SessionFactory.make({ id: 'session-EXISTENT-123' }).unwrap(),
          ),
        ),
      );

    const command = new CreateSessionCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      ApplicationException,
    );
  });
});
