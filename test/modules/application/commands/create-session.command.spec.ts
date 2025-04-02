/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { CreateSessionHandler } from '@modules/session/application/commands/create-session.handler';
import { CreateSessionCommand } from '@modules/session/application/commands/create-session.command';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { BadRequestException } from '@nestjs/common';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { CreateSessionDto } from '@modules/session/application/dtos/create-session.dto';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Result } from '@sputnik-labs/api-sdk';

describe('CreateSessionHandler', () => {
  let handler: CreateSessionHandler;
  let sessionRepository: MockProxy<SessionRepository>;
  let eventPublisher: MockProxy<EventPublisher>;

  beforeEach(async () => {
    sessionRepository = mock<SessionRepository>();
    eventPublisher = mock<EventPublisher>();

    eventPublisher.mergeObjectContext.mockImplementation((s) => s);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
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
  });

  const validDto: CreateSessionDto = {
    userId: 'user-123',
    device: DEVICE_TYPES.IOS,
    userAgent: 'test-agent',
    ip: '127.0.0.1',
  };

  it('should create a session and call save + commit', async () => {
    const command = new CreateSessionCommand(validDto);
    const session = await handler.execute(command);

    expect(session).toBeInstanceOf(Session);
    expect(session.get('userId').value()).toBe(validDto.userId);

    expect(sessionRepository.save).toHaveBeenCalledWith(session);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledTimes(1);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(session);
  });

  it('should throw BadRequestException when session creation fails', async () => {
    jest
      .spyOn(Session, 'create')
      .mockReturnValueOnce({ isErr: () => true } as unknown as Result<Session>);

    const command = new CreateSessionCommand({
      ...validDto,
      device: 'invalid-device',
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
