import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidateSessionHandler } from '@modules/auth/application/commands/auth/validate-session.handler';
import { ValidateSessionCommand } from '@modules/auth/application/commands/auth/validate-session.command';
import { Err, Ok } from '@inpro-labs/core';
import { BusinessException } from '@shared/exceptions/business.exception';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { RetrieveSessionByTokenService } from '@modules/auth/application/services/session/retrieve-session-by-token.service';

describe('ValidateSessionHandler', () => {
  let handler: ValidateSessionHandler;
  let retrieveSessionByTokenService: MockProxy<RetrieveSessionByTokenService>;

  beforeAll(async () => {
    retrieveSessionByTokenService = mock<RetrieveSessionByTokenService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ValidateSessionHandler,
        {
          provide: RetrieveSessionByTokenService,
          useValue: retrieveSessionByTokenService,
        },
      ],
    }).compile();

    handler = module.get(ValidateSessionHandler);
  });

  beforeEach(() => {
    retrieveSessionByTokenService.execute.mockReset();
  });

  const validAccessToken = 'valid-access-token';

  it('should validate a session successfully', async () => {
    const session = SessionFactory.make({
      id: 'session-123',
      deviceId: 'device-123',
      userId: 'user-123',
    }).unwrap();

    retrieveSessionByTokenService.execute.mockResolvedValue(Ok(session));

    const command = new ValidateSessionCommand({
      accessToken: validAccessToken,
    });
    const result = await handler.execute(command);

    expect(result).toEqual({
      isValid: true,
      userId: session.get('userId').value(),
      sessionId: session.id.value(),
      expiresAt: session.get('expiresAt'),
    });
    expect(retrieveSessionByTokenService.execute).toHaveBeenCalledWith(
      validAccessToken,
    );
  });

  it('should throw BusinessException when token is invalid', async () => {
    const error = new Error('Invalid token');
    retrieveSessionByTokenService.execute.mockResolvedValue(Err(error));

    const command = new ValidateSessionCommand({
      accessToken: 'invalid-token',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      new BusinessException(error.message, 'INVALID_TOKEN', 401),
    );
  });
});
