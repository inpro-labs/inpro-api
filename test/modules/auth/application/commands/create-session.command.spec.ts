import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { CreateSessionHandler } from '@modules/auth/application/commands/session/create-session.handler';
import { CreateSessionCommand } from '@modules/auth/application/commands/session/create-session.command';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { CreateSessionInputDTO } from '@modules/auth/application/ports/in/session/create-session.port';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Result } from '@inpro-labs/core';
import { BusinessException } from '@shared/exceptions/business.exception';
import { HashModule } from '@shared/security/hash/hash.module';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { IEncryptService } from '@shared/security/encrypt/interfaces/encrypt.service.interface';

describe('CreateSessionHandler', () => {
  let handler: CreateSessionHandler;
  let sessionRepository: MockProxy<ISessionRepository>;
  let eventPublisher: MockProxy<EventPublisher>;
  let encryptService: MockProxy<IEncryptService>;

  beforeAll(async () => {
    sessionRepository = mock<ISessionRepository>();
    eventPublisher = mock<EventPublisher>();
    encryptService = mock<IEncryptService>();

    eventPublisher.mergeObjectContext.mockImplementation((s) => s);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HashModule],
      providers: [
        CreateSessionHandler,
        {
          provide: IEncryptService,
          useValue: encryptService,
        },
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

    handler = module.get(CreateSessionHandler);

    sessionRepository.findActiveSession.mockResolvedValue(
      Result.ok(SessionFactory.make({ id: 'session-123' }).unwrap()),
    );
    sessionRepository.save.mockResolvedValue(
      Result.ok(SessionFactory.make({ id: 'session-123' }).unwrap()),
    );

    encryptService.generateHmacDigest.mockReturnValue(Result.ok('digest'));

    sessionRepository.findActiveSession.mockRejectedValue(
      Result.err(
        new BusinessException('Session not found', 'SESSION_NOT_FOUND', 404),
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
            new BusinessException(
              'Session not found',
              'SESSION_NOT_FOUND',
              404,
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

  it('should throw BusinessException when session creation fails', async () => {
    const session = SessionFactory.make();

    jest
      .spyOn(sessionRepository, 'findActiveSession')
      .mockReturnValueOnce(Promise.resolve(Result.ok(session.unwrap())));

    const command = new CreateSessionCommand({
      ...validDto,
      device: 'invalid-device',
    });

    await expect(handler.execute(command)).rejects.toThrow(BusinessException);
  });

  it('should throw BusinessException when session already exists', async () => {
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

    await expect(handler.execute(command)).rejects.toThrow(BusinessException);
  });
});
