/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { RefreshTokenHandler } from '@modules/auth/application/commands/auth/refresh-token.handler';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';
import { Err, Ok } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let authService: MockProxy<AuthService>;

  beforeAll(async () => {
    authService = mock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RefreshTokenHandler,
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    handler = module.get(RefreshTokenHandler);
  });

  const refreshToken = 'valid-refresh-token';

  it('should refresh tokens successfully', async () => {
    const user = UserFactory.make('user-123');
    const session = SessionFactory.make('session-123').unwrap();

    authService.getRefreshTokenSession.mockResolvedValue(Ok({ session, user }));

    const tokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    authService.generateTokens.mockReturnValue(Ok(tokens));

    const command = new RefreshTokenCommand(refreshToken);
    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expect.any(Date),
    });

    expect(authService.getRefreshTokenSession).toHaveBeenCalledWith(
      refreshToken,
    );
    expect(authService.generateTokens).toHaveBeenCalledWith(
      session.id.value(),
      user,
    );
  });

  it('should throw ApplicationException when refresh token is invalid', async () => {
    authService.getRefreshTokenSession.mockResolvedValue(
      Err(new Error('Invalid refresh token')),
    );

    const command = new RefreshTokenCommand('invalid-token');

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException(
        'Invalid credentials',
        401,
        'INVALID_CREDENTIALS',
      ),
    );
  });

  it('should throw ApplicationException when token generation fails', async () => {
    const user = UserFactory.make('user-123');
    const session = SessionFactory.make('session-123').unwrap();

    authService.getRefreshTokenSession.mockResolvedValue(Ok({ session, user }));

    authService.generateTokens.mockReturnValue(
      Err(new Error('Failed to generate tokens')),
    );

    const command = new RefreshTokenCommand(refreshToken);

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException(
        'Failed to generate tokens',
        500,
        'FAILED_TO_GENERATE_TOKENS',
      ),
    );
  });
});
