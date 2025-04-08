import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@inpro-labs/api-sdk';
import { JwtService } from '@nestjs/jwt';
import { TcpAuthGuard } from '@shared/infra/security/jwt/guards/tcp-auth.guard';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 4001,
      },
    },
  );
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  app.useGlobalGuards(new TcpAuthGuard(new Reflector(), new JwtService()));
  await app.listen();
}

void bootstrap();
