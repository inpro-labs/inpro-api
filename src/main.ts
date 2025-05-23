import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@shared/nest/filters/http-exception.filter';

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
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync(
    join(__dirname, '..', 'docs', 'api.json'),
    JSON.stringify(document, null, 2),
  );

  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
