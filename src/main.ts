import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from FE directory and set index.html
  app.useStaticAssets(join(__dirname, '..', 'FE'));

  // Serve audio files from public/audio directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('3D Action Analysis API')
    .setDescription(
      'API for analyzing text and generating 3D character actions',
    )
    .setVersion('1.0')
    .addTag('actions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  logger.log(`Environment NODE_PORT: ${process.env.NODE_PORT}`);

  const port = process.env.NODE_PORT || 3002;
  logger.log(`Using port: ${port}`);
  await app.listen(port);

  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🎯 API endpoint: http://localhost:${port}/api/action/analyze`);
}

bootstrap();
