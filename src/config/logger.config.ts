import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';
import * as path from 'path';

// Define log directory
const logDir = path.join(process.cwd(), 'logs');

// Custom format for file logs
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

// Console format for development (only errors and warnings)
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.ms(),
  nestWinstonModuleUtilities.format.nestLike('FitSmart', {
    colors: true,
    prettyPrint: true,
  }),
);

// Filter to only log debug level (not info or verbose)
const debugOnlyFilter = format((info) => {
  return info.level === 'debug' ? info : false;
});

// Daily rotate file for errors only
const errorRotateFileTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs for 30 days
  format: fileFormat,
});

// Daily rotate file for ONLY debug logs (not info, not verbose)
const debugRotateFileTransport = new DailyRotateFile({
  level: 'debug',
  filename: path.join(logDir, 'debug-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep debug logs for 14 days
  format: format.combine(
    debugOnlyFilter(),
    fileFormat
  ),
});

// Create winston logger instance
export const winstonLoggerConfig = WinstonModule.createLogger({
  level: 'info', // NestJS needs info level for bootstrap
  transports: [
    // Console transport - only show errors and warnings
    new winston.transports.Console({
      level: 'warn',
      format: consoleFormat,
    }),
    // File transports
    errorRotateFileTransport,
    debugRotateFileTransport,
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
});

// Export for module configuration
export const createWinstonLogger = () => {
  return {
    level: 'info',
    transports: [
      new winston.transports.Console({
        level: 'warn',
        format: consoleFormat,
      }),
      errorRotateFileTransport,
      debugRotateFileTransport,
    ],
    exceptionHandlers: [
      new DailyRotateFile({
        filename: path.join(logDir, 'exceptions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
      }),
    ],
    rejectionHandlers: [
      new DailyRotateFile({
        filename: path.join(logDir, 'rejections-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
      }),
    ],
  };
};
