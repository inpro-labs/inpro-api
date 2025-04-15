import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@inpro-labs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'auth-service',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}

void bootstrap();
