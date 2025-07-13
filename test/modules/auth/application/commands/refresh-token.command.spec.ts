import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { RefreshTokenHandler } from '@modules/auth/application/commands/auth/refresh-token.handler';
import { RefreshTokenCommand } from '@modules/auth/application/commands/auth/refresh-token.command';
import { Err, Ok } from '@inpro-labs/core';
import { BusinessException } from '@shared/exceptions/business.exception';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { GetRefreshTokenSessionService } from '@modules/auth/application/services/auth/get-refresh-token-session.service';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';
import { UpdateSessionRefreshTokenService } from '@modules/auth/application/services/auth/update-session-refresh-token.service';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let getRefreshTokenSessionService: MockProxy<GetRefreshTokenSessionService>;
  let generateTokensService: MockProxy<GenerateTokensService>;
  let updateSessionRefreshTokenService: MockProxy<UpdateSessionRefreshTokenService>;

  beforeAll(async () => {
    getRefreshTokenSessionService = mock<GetRefreshTokenSessionService>();
    generateTokensService = mock<GenerateTokensService>();
    updateSessionRefreshTokenService = mock<UpdateSessionRefreshTokenService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RefreshTokenHandler,
        {
          provide: GetRefreshTokenSessionService,
          useValue: getRefreshTokenSessionService,
        },
        {
          provide: GenerateTokensService,
          useValue: generateTokensService,
        },
        {
          provide: UpdateSessionRefreshTokenService,
          useValue: updateSessionRefreshTokenService,
        },
      ],
    }).compile();

    handler = module.get(RefreshTokenHandler);
  });

  const refreshToken = 'valid-refresh-token';

  it('should refresh tokens successfully', async () => {
    const user = UserFactory.make('user-123');
    const session = SessionFactory.make({ id: 'session-123' }).unwrap();

    getRefreshTokenSessionService.execute.mockResolvedValue(
      Ok({ session, user }),
    );

    const tokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    generateTokensService.execute.mockReturnValue(Ok(tokens));

    const command = new RefreshTokenCommand(refreshToken);
    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expect.any(Date) as Date,
    });

    expect(getRefreshTokenSessionService.execute).toHaveBeenCalledWith(
      refreshToken,
    );
    expect(generateTokensService.execute).toHaveBeenCalledWith(
      session.id.value(),
      user,
      session.get('deviceId'),
    );
  });

  it('should throw BusinessException when refresh token is invalid', async () => {
    getRefreshTokenSessionService.execute.mockResolvedValue(
      Err(new Error('Invalid refresh token')),
    );

    const command = new RefreshTokenCommand('invalid-token');

    await expect(handler.execute(command)).rejects.toThrow(
      new BusinessException(
        'Invalid refresh token',
        'INVALID_CREDENTIALS',
        401,
      ),
    );
  });

  it('should throw BusinessException when token generation fails', async () => {
    const user = UserFactory.make('user-123');
    const session = SessionFactory.make({ id: 'session-123' }).unwrap();

    getRefreshTokenSessionService.execute.mockResolvedValue(
      Ok({ session, user }),
    );

    generateTokensService.execute.mockReturnValue(
      Err(new Error('Failed to generate tokens')),
    );

    const command = new RefreshTokenCommand(refreshToken);

    await expect(handler.execute(command)).rejects.toThrow(
      new BusinessException(
        'Failed to generate tokens',
        'FAILED_TO_GENERATE_TOKENS',
        500,
      ),
    );
  });
});
