/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { SignInHandler } from '@modules/auth/application/commands/auth/sign-in.handler';
import { SignInCommand } from '@modules/auth/application/commands/auth/sign-in.command';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';
import { SignInInputDTO } from '@modules/auth/application/dtos/auth/sign-in-input.dto';
import { Err, ID, Ok, Result } from '@inpro-labs/core';
import { ApplicationException } from '@inpro-labs/microservices';
import { UserFactory } from '@test/factories/fake-user.factory';
import { DEVICE_TYPES } from '@shared/constants/devices';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let authService: MockProxy<AuthService>;
  let commandBus: MockProxy<CommandBus>;

  beforeAll(async () => {
    authService = mock<AuthService>();
    commandBus = mock<CommandBus>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        SignInHandler,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: CommandBus,
          useValue: commandBus,
        },
      ],
    }).compile();

    handler = module.get(SignInHandler);

    jest
      .spyOn(ID, 'create')
      .mockReturnValue(Ok(ID.create('session-id').unwrap()));
  });

  const validDto: SignInInputDTO = {
    email: 'test@example.com',
    password: 'Password123',
    userId: 'user-123',
    device: DEVICE_TYPES.IOS,
    deviceId: 'device-123',
    userAgent: 'test-agent',
    ip: '127.0.0.1',
  };

  it('should authenticate a user and return tokens', async () => {
    const user = UserFactory.make('user-123');
    authService.validateUserCredentials.mockResolvedValue(Ok(user));

    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    authService.generateTokens.mockReturnValue(Ok(tokens));
    commandBus.execute.mockResolvedValue(undefined);

    const command = new SignInCommand(validDto);
    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expect.any(Date),
    });

    expect(authService.validateUserCredentials).toHaveBeenCalledWith(
      validDto.email,
      validDto.password,
    );

    expect(authService.generateTokens).toHaveBeenCalledWith('session-id', user);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });

  it('should throw ApplicationException when credentials are invalid', async () => {
    authService.validateUserCredentials.mockResolvedValue(
      Err(new Error('Invalid credentials')),
    );

    const command = new SignInCommand(validDto);

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
    authService.validateUserCredentials.mockResolvedValue(Ok(user));

    authService.generateTokens.mockReturnValue(
      Err(new Error('Failed to generate tokens')),
    );

    const command = new SignInCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException(
        'Failed to generate tokens',
        500,
        'FAILED_TO_GENERATE_TOKENS',
      ),
    );
  });
});
