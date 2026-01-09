import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  error(message: string, trace?: string, context?: string, data?: any) {
    const logContext = context || this.context;
    this.logger.error(message, {
      context: logContext,
      trace,
      data,
    });
  }

  warn(message: string, context?: string, data?: any) {
    const logContext = context || this.context;
    this.logger.warn(message, { 
      context: logContext,
      data,
    });
  }

  debug(message: string, data?: any, context?: string) {
    const logContext = context || this.context;
    this.logger.debug(message, {
      context: logContext,
      data,
    });
  }

  log(message: string, context?: string) {
    this.debug(message, undefined, context);
  }

  verbose(message: string, context?: string) {
    this.debug(message, undefined, context);
  }
}
