import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateSessionDto } from '@modules/session/application/dtos/create-session.dto';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { ListUserSessionsDto } from '@modules/session/application/dtos/list-user-sessions.dto';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { RevokeSessionDto } from '@modules/session/application/dtos/revoke-session.dto';
import { SessionViewModel } from '@modules/session/presentation/view-model/session.view-model';

type SessionResponse = SessionViewModel;

describe('Session Microservice (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let prismaService: PrismaService;

  const userId = 'user-id';
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app = moduleFixture.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 4001,
      },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 4001,
      },
    });

    await client.connect();
  });

  afterAll(async () => {
    await prismaService.session.deleteMany({
      where: {
        userId,
      },
    });

    await client.close();
    await app.close();
  });

  it('create_session / should create a session', async () => {
    const createSessionDto: CreateSessionDto = {
      deviceId: 'test-device-id',
      userId,
      device: DEVICE_TYPES.IOS,
      userAgent: 'test-user-agent',
      ip: 'test-ip',
    };

    const source$ = client.send<SessionResponse, CreateSessionDto>(
      'create_session',
      createSessionDto,
    );
    const result = await firstValueFrom(source$);

    sessionId = result.id;

    expect(result).toBeDefined();
    expect(result.userId).toBe(createSessionDto.userId);
    expect(
      (result as unknown as { refreshTokenHash: string }).refreshTokenHash,
    ).toBeUndefined();
    expect(result.deviceId).toBe(createSessionDto.deviceId);
  });

  it('revoke_session / should revoke a session', async () => {
    const source$ = client.send<SessionResponse, RevokeSessionDto>(
      'revoke_session',
      { sessionId },
    );
    const result = await firstValueFrom(source$);

    expect(result).toBeDefined();
    expect(result.id).toBe(sessionId);
    expect(result.revokedAt).not.toBeNull();
  });

  it('list_user_sessions / should list user sessions', async () => {
    const source$ = client.send<SessionResponse[], ListUserSessionsDto>(
      'list_user_sessions',
      { userId },
    );
    const result = await firstValueFrom(source$);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
  });
});
