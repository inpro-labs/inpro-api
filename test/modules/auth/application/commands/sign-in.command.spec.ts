import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { SignInHandler } from '@modules/auth/application/commands/auth/sign-in.handler';
import { SignInCommand } from '@modules/auth/application/commands/auth/sign-in.command';
import { SignInInputDTO } from '@modules/auth/application/ports/in/auth/sign-in.port';
import { Err, ID, Ok } from '@inpro-labs/core';
import { BusinessException } from '@shared/exceptions/business.exception';
import { UserFactory } from '@test/factories/fake-user.factory';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { ValidateUserCredentialsService } from '@modules/auth/application/services/auth/validate-user-credentials.service';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let validateUserCredentialsService: MockProxy<ValidateUserCredentialsService>;
  let generateTokensService: MockProxy<GenerateTokensService>;
  let commandBus: MockProxy<CommandBus>;

  beforeAll(async () => {
    validateUserCredentialsService = mock<ValidateUserCredentialsService>();
    generateTokensService = mock<GenerateTokensService>();
    commandBus = mock<CommandBus>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        SignInHandler,
        {
          provide: ValidateUserCredentialsService,
          useValue: validateUserCredentialsService,
        },
        {
          provide: GenerateTokensService,
          useValue: generateTokensService,
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
    validateUserCredentialsService.execute.mockResolvedValue(Ok(user));

    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    generateTokensService.execute.mockReturnValue(Ok(tokens));
    commandBus.execute.mockResolvedValue(undefined);

    const command = new SignInCommand(validDto);
    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expect.any(Date) as Date,
    });

    expect(validateUserCredentialsService.execute).toHaveBeenCalledWith(
      validDto.password,
      validDto.email,
    );

    expect(generateTokensService.execute).toHaveBeenCalledWith(
      'session-id',
      user,
      validDto.deviceId,
    );

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });

  it('should throw BusinessException when credentials are invalid', async () => {
    validateUserCredentialsService.execute.mockResolvedValue(
      Err(new Error('Invalid credentials')),
    );

    const command = new SignInCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      new BusinessException('Invalid credentials', 'INVALID_CREDENTIALS', 401),
    );
  });

  it('should throw BusinessException when token generation fails', async () => {
    const user = UserFactory.make('user-123');
    validateUserCredentialsService.execute.mockResolvedValue(Ok(user));

    generateTokensService.execute.mockReturnValue(
      Err(new Error('Failed to generate tokens')),
    );

    const command = new SignInCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      new BusinessException(
        'Failed to generate tokens',
        'FAILED_TO_GENERATE_TOKENS',
        500,
      ),
    );
  });
});
