import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { GenerateTokensService } from '@modules/auth/application/services/auth/generate-tokens.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { EnvService } from '@config/env/env.service';

describe('GenerateTokensService', () => {
  let service: GenerateTokensService;
  let jwtService: MockProxy<JwtService>;
  let envService: MockProxy<EnvService>;

  beforeEach(async () => {
    jwtService = mock<JwtService>();
    envService = mock<EnvService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        GenerateTokensService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: EnvService,
          useValue: envService,
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
    const deviceId = 'device-123';

    it('should generate tokens successfully', () => {
      const user = UserFactory.make('user-123');

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = service.execute(sessionId, user, deviceId);

      expect(result.isOk()).toBe(true);
      const tokens = result.unwrap();
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
