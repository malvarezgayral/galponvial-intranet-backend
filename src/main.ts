import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.API_GLOBAL_PREFIX ?? '' ;

  // Configuración de CORS para desarrollo
  app.enableCors({
    origin: 'https://silver-spork-qvqr5jv7gpx63xpxv-5173.app.github.dev',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('API Galpón Vial')
    .setDescription(
      'API para la gestión y administración del galpón vial municipal de Lobería',
    )
    .setVersion('1.0')
    .addServer(`/${globalPrefix}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
