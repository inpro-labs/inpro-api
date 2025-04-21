/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidateSessionHandler } from '@modules/auth/application/commands/auth/validate-session.handler';
import { ValidateSessionCommand } from '@modules/auth/application/commands/auth/validate-session.command';
import { SessionService } from '@modules/auth/application/interfaces/services/session.service.interface';
import { Err, Ok } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { SessionFactory } from '@test/factories/fake-session.factory';

describe('ValidateSessionHandler', () => {
  let handler: ValidateSessionHandler;
  let sessionService: MockProxy<SessionService>;

  beforeAll(async () => {
    sessionService = mock<SessionService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ValidateSessionHandler,
        {
          provide: SessionService,
          useValue: sessionService,
        },
      ],
    }).compile();

    handler = module.get(ValidateSessionHandler);
  });

  const validAccessToken = 'valid-access-token';

  it('should validate a session successfully', async () => {
    const session = SessionFactory.make('session-123').unwrap();
    sessionService.retrieveSessionByToken.mockResolvedValue(Ok(session));

    const command = new ValidateSessionCommand({
      accessToken: validAccessToken,
    });
    const result = await handler.execute(command);

    expect(result).toEqual({ isValid: true });
    expect(sessionService.retrieveSessionByToken).toHaveBeenCalledWith(
      validAccessToken,
    );
  });

  it('should throw ApplicationException when token is invalid', async () => {
    const error = new Error('Invalid token');
    sessionService.retrieveSessionByToken.mockResolvedValue(Err(error));

    const command = new ValidateSessionCommand({
      accessToken: 'invalid-token',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException(error.message, 401, 'INVALID_TOKEN'),
    );
  });
});
