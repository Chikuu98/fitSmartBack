import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let validationErrors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const err = res as Record<string, any>;

        message = err.message || message;

        // ✅ Preserve validation errors
        if (err.validation_errors) {
          validationErrors = err.validation_errors;
        }

        errorCode =
          err.errorCode || err.error || HttpStatus[status] || 'UNKNOWN_ERROR';
      }
    }

    const responseBody: Record<string, any> = {
      success: false,
      message,
      errorCode,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (validationErrors) {
      responseBody['validation_errors'] = validationErrors;
    }

    response.status(status).json(responseBody);
  }
}
