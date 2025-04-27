import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';

describe('GenerateTokensService', () => {
  let service: GenerateTokensService;
  let jwtService: MockProxy<JwtService>;

  beforeEach(async () => {
    jwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateTokensService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<GenerateTokensService>(GenerateTokensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const sessionId = 'session-123';

    it('should generate tokens successfully', () => {
      const user = UserFactory.make('user-123');

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: '5m',
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
        JWT_SECRET: 'test-secret',
      };

      const result = service.execute(sessionId, user);

      expect(result.isOk()).toBe(true);
      const tokens = result.unwrap();
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);

      process.env = originalEnv;
    });
  });
});
