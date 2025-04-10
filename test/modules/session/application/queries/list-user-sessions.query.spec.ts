/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { SessionRepository } from '@modules/session/domain/repositories/session.repository.interface';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Result } from '@inpro-labs/api-sdk';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from '@modules/session/application/queries/session/list-user-sessions.handler';
import { ListUserSessionsDto } from '@modules/session/application/dtos/session/list-user-sessions.dto';
import { ListUserSessionsQuery } from '@modules/session/application/queries/session/list-user-sessions.query';
import { PrismaService } from '@shared/infra/services/prisma.service';

describe('ListUserSessionsHandler', () => {
  let handler: ListUserSessionsHandler;
  let sessionRepository: MockProxy<SessionRepository>;
  let eventPublisher: MockProxy<EventPublisher>;

  beforeAll(async () => {
    sessionRepository = mock<SessionRepository>();
    eventPublisher = mock<EventPublisher>();

    eventPublisher.mergeObjectContext.mockImplementation((s) => s);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HashModule],
      providers: [
        ListUserSessionsHandler,
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        PrismaService,
      ],
    }).compile();

    handler = module.get(ListUserSessionsHandler);
  });

  const validDto: ListUserSessionsDto = {
    userId: 'user-123',
  };

  it('should list user sessions', async () => {
    jest.spyOn(sessionRepository, 'findAllByUserId').mockResolvedValueOnce(
      new Result(
        [
          {
            id: 'session-123',
          } as unknown as Session,
        ],
        null,
      ),
    );

    const command = new ListUserSessionsQuery(validDto.userId);
    const data = await handler.execute(command);

    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(1);
    expect(sessionRepository.findAllByUserId).toHaveBeenCalledWith(
      validDto.userId,
    );
  });
});
