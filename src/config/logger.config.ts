import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.ms(),
  nestWinstonModuleUtilities.format.nestLike('FitSmart', {
    colors: true,
    prettyPrint: true,
  }),
);

const debugOnlyFilter = format((info) => {
  return info.level === 'debug' ? info : false;
});

const errorRotateFileTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

const debugRotateFileTransport = new DailyRotateFile({
  level: 'debug',
  filename: path.join(logDir, 'debug-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    debugOnlyFilter(),
    fileFormat
  ),
});

export const winstonLoggerConfig = WinstonModule.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      level: 'info',
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
});

export const createWinstonLogger = () => {
  return {
    level: 'info',
    transports: [
      new winston.transports.Console({
        level: 'info',
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
