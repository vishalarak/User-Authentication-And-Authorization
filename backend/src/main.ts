import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path'; // Import join from the path module
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.enableCors();

  // Dynamically get the path to the uploads directory
  const uploadsPath = join(__dirname, '..', 'uploads');

  app.useStaticAssets(uploadsPath);

  await app.listen(3001);
}
bootstrap();
