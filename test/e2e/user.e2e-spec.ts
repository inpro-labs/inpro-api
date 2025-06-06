import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';

interface UserViewModel {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
}

describe('User Microservice (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let prismaGateway: PrismaGateway;

  const randomSuffix = Math.floor(Math.random() * 10000);
  const userEmail = `test-${randomSuffix}@example.com`;
  const userPassword = 'SecurePassword_123';
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaGateway = moduleFixture.get<PrismaGateway>(PrismaGateway);

    app = moduleFixture.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'auth-service',
        queueOptions: {
          durable: false,
        },
      },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'auth-service',
        queueOptions: {
          durable: false,
        },
      },
    });

    await client.connect();
  });

  afterAll(async () => {
    if (userId) {
      await prismaGateway.user.delete({
        where: { id: userId },
      });
    }

    await client.close();
    await app.close();
  });

  it('create_user / should create a user', async () => {
    const createUserDto = {
      email: userEmail,
      password: userPassword,
    };

    const source$ = client.send<
      MicroserviceResponse<UserViewModel>,
      typeof createUserDto
    >('create_user', createUserDto);

    const response = await firstValueFrom(source$);
    const user = response.data!;

    userId = user.id;

    expect(user).toBeDefined();
    expect(user.email).toBe(userEmail);
    expect(user.verified).toBe(false);
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
    expect(user).not.toHaveProperty('password');
  });

  it('find_user_by_email / should find a user by email', async () => {
    const findUserDto = {
      email: userEmail,
    };

    const source$ = client.send<
      MicroserviceResponse<UserViewModel>,
      typeof findUserDto
    >('find_user_by_email', findUserDto);

    const response = await firstValueFrom(source$);
    const user = response.data;

    expect(user).toBeDefined();
    expect(user!.id).toBe(userId);
    expect(user!.email).toBe(userEmail);
  });

  it('find_user_by_id / should find a user by id', async () => {
    const findUserDto = {
      id: userId,
    };

    const source$ = client.send<
      MicroserviceResponse<UserViewModel>,
      typeof findUserDto
    >('find_user_by_id', findUserDto);

    const response = await firstValueFrom(source$);
    const user = response.data;

    expect(user).toBeDefined();
    expect(user!.id).toBe(userId);
    expect(user!.email).toBe(userEmail);
  });
});
