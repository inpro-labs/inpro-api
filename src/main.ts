import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@shared/nest/filters/http-exception.filter';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor } from '@shared/nest/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('InPro API')
    .setVersion('0.0.1')
    .setContact(
      'Maxwell Macedo',
      'https://github.com/MaxwellOlliver',
      'maxwell.macedo@moondev.com.br',
    )
    .setDescription('Here is the API documentation for InPro')
    .addServer('http://localhost:3000')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'jwt',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Sessions', 'Session management endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  patchNestjsSwagger();

  const document = SwaggerModule.createDocument(app, config);

  const docsPath = join(__dirname, '..', 'docs');
  mkdirSync(docsPath, { recursive: true });
  writeFileSync(join(docsPath, 'api.json'), JSON.stringify(document, null, 2), {
    encoding: 'utf-8',
    flag: 'w',
  });

  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
