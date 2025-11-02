import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from './config/swagger.config';
import { AllExceptionsFilter } from './config/http-exception.filter';
import { winstonLoggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLoggerConfig,
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      exceptionFactory: (validationErrors = []) => {
        const errors = validationErrors.map((error) => ({
          [error.property]: Object.values(error.constraints || {}).join(', '),
        }));

        return new BadRequestException({
          success: false,
          validation_errors: errors,
          message: 'Validation failed',
          statusCode: 400,
        });
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') ?? '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/api-docs`);
  console.log(`Logs are being written to: ${process.cwd()}/logs`);
}
bootstrap();
