import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { SignOutHandler } from '@modules/auth/application/commands/auth/sign-out.handler';
import { SignOutCommand } from '@modules/auth/application/commands/auth/sign-out.command';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { ApplicationException } from '@inpro-labs/microservices';
import { Err, Ok } from '@inpro-labs/core';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { ConfigModule } from '@nestjs/config';
import { TokenPayload } from '@modules/auth/domain/value-objects/token-payload.entity';
import { JwtModule } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

describe('SignOutHandler', () => {
  let handler: SignOutHandler;
  let sessionRepository: MockProxy<ISessionRepository>;
  let jwtService: MockProxy<JwtService>;
  let validDto: { accessToken: string };

  const tokenPayload = TokenPayload.create({
    sid: 'session-123',
    sub: 'user-123',
    email: 'user@example.com',
    deviceId: randomUUID(),
    jti: randomUUID(),
  }).unwrap();

  beforeAll(async () => {
    sessionRepository = mock<ISessionRepository>();
    jwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          global: true,
        }),
      ],
      providers: [
        SignOutHandler,
        {
          provide: ISessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    handler = module.get(SignOutHandler);
    jwtService.verify.mockReturnValue(Ok(tokenPayload));
    jwtService.sign.mockReturnValue('tokenPayload');
    validDto = {
      accessToken: jwtService.sign(tokenPayload, {
        expiresIn: '1h',
      }),
    };
  });

  beforeEach(() => {
    sessionRepository.findById.mockReset();
    sessionRepository.delete.mockReset();
  });

  const sessionMock = SessionFactory.make({
    id: tokenPayload.get('sid'),
    userId: tokenPayload.get('sub'),
  }).unwrap();

  it('should sign out successfully', async () => {
    sessionRepository.findById.mockResolvedValue(Ok(sessionMock));
    sessionRepository.delete.mockResolvedValue(Ok(undefined));

    const command = new SignOutCommand(validDto);

    await expect(handler.execute(command)).resolves.toBeUndefined();

    expect(sessionRepository.findById).toHaveBeenCalledWith(
      tokenPayload.get('sid'),
    );
    expect(sessionRepository.delete).toHaveBeenCalledWith(
      tokenPayload.get('sid'),
    );
  });

  it('should throw ApplicationException if session is not found', async () => {
    sessionRepository.findById.mockResolvedValue(
      Err(new Error('Session not found')),
    );

    const command = new SignOutCommand(validDto);

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException('Session not found', 404, 'SESSION_NOT_FOUND'),
    );

    expect(sessionRepository.findById).toHaveBeenCalledWith(
      tokenPayload.get('sid'),
    );
  });

  it('should throw ApplicationException if user does not own the session', async () => {
    const wrongIdTokenPayload = TokenPayload.create({
      sid: sessionMock.id.value(),
      sub: 'another-user',
      email: 'user@example.com',
      deviceId: sessionMock.get('deviceId'),
      jti: randomUUID(),
    }).unwrap();

    jwtService.verify.mockReturnValue(Ok(wrongIdTokenPayload));

    sessionRepository.findById.mockResolvedValue(Ok(sessionMock));

    const command = new SignOutCommand({
      accessToken: jwtService.sign(wrongIdTokenPayload, {
        expiresIn: '1h',
      }),
    });

    await expect(handler.execute(command)).rejects.toThrow(
      new ApplicationException(
        'User does not own this session',
        403,
        'USER_DOES_NOT_OWN_SESSION',
      ),
    );

    expect(sessionRepository.findById).toHaveBeenCalledWith(
      sessionMock.id.value(),
    );
    expect(sessionRepository.delete).not.toHaveBeenCalled();
  });
});
