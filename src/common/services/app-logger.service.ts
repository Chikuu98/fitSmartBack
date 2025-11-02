import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/**
 * Simplified Logger Service for errors, exceptions, and debug logs only
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Set the context for log messages
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log error messages with optional stack trace
   * Use this for any errors that occur in your application
   */
  error(message: string, trace?: string, context?: string) {
    const logContext = context || this.context;
    this.logger.error(message, {
      context: logContext,
      trace,
    });
  }

  /**
   * Log warning messages
   * Use this for potential problems or unusual situations
   */
  warn(message: string, context?: string) {
    const logContext = context || this.context;
    this.logger.warn(message, { context: logContext });
  }

  /**
   * Log debug messages
   * Use this for custom debug information you want to track
   */
  debug(message: string, data?: any, context?: string) {
    const logContext = context || this.context;
    this.logger.debug(message, {
      context: logContext,
      data,
    });
  }

  /**
   * Required by NestJS LoggerService interface
   * Maps to debug level
   */
  log(message: string, context?: string) {
    this.debug(message, undefined, context);
  }

  /**
   * Required by NestJS LoggerService interface
   * Maps to debug level
   */
  verbose(message: string, context?: string) {
    this.debug(message, undefined, context);
  }
}
