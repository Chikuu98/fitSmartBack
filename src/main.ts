import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  app.enableCors({
    origin: configService.get<number>('FRONTEND_URL') ?? '*',
    credentials: true,
    methods: '*',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
      exceptionFactory: (validationErrors = []) => {
        const errors = validationErrors.map((error) => ({
          [error.property]: Object.values(error.constraints || {}).join(', '),
        }));

        return new BadRequestException({
          success: false,
          validation_erros: errors,
          message: 'Validation failed',
        });
      },
    }),
  );
  await app.listen(port);
}
bootstrap();
