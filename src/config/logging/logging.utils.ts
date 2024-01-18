import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { redact } from '@src/utils/serialisation';
import { DEFAULT_LOG_LEVEL, Loglevel, Loglevels, colors, levels } from './logging.constant';

const { cli, combine, errors, json, printf, splat, timestamp } = winston.format;

/**---- Logger interface ----**/

type ILogger<Levels extends string> = {
  [K in 'log' | Lowercase<Levels>]: (message: unknown, ...optionalParams: unknown[]) => void;
};

const UniformLogger = (loggerOptions?: winston.LoggerOptions) => {
  const logger = winston.createLogger(loggerOptions);

  const _log =
    (level: Loglevel): ILogger<Loglevel>[Lowercase<Loglevel>] =>
    (message, ...optionalParams) => {
      if (message !== undefined) logger.log(level, { message, splat: optionalParams });
    };

  return Loglevels.reduce(
    (target, loglevel) => {
      target[loglevel.toLowerCase() as Lowercase<typeof loglevel>] = _log(loglevel);
      return target;
    },
    { log: _log('INFO') } as ILogger<Loglevel>,
  );
};

/**---- Logger options ----**/

type ErrInfo = { cause?: ErrInfo; stack?: unknown };
const messageFormat = printf((info) => {
  const message: unknown = info.message;
  let value = typeof message === 'object' ? JSON.stringify(message) : (message as string);
  let e = info as ErrInfo | undefined;
  if (e?.stack) for (let i = 0; e; e = e.cause, i++) value += `\n[${i}] ${String(e.stack)}`;

  info.message = value;
  return info.message as string;
});

const consolePrintFormat = printf((info) => {
  return `${info.timestamp} ${info.level} ${info.message}`;
});

const commonFormat = combine(errors({ stack: true }), timestamp(), messageFormat, splat());

const Formats = {
  console: combine(commonFormat, cli({ colors, levels }), consolePrintFormat),
  file: combine(commonFormat, json({ replacer: redact((k) => k === 'splat') })),
};

const Transports = Object.freeze({
  console: () =>
    new winston.transports.Console({
      format: Formats.console,
    }),
  file: () =>
    new winston.transports.File({
      format: Formats.file,
      dirname: 'logs/service',
      filename: `${new Date().toISOString()}.log`,
    }),
  dailyRotateFile: () =>
    new DailyRotateFile({
      format: Formats.file,
      dirname: 'logs/service',
      filename: `%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
});

/** create logger options with default parameters */
const createLoggerOptions = (options?: winston.LoggerOptions) => ({
  levels,
  level: DEFAULT_LOG_LEVEL,
  transports: [Transports.console(), Transports.dailyRotateFile()],
  ...options,
});

type LoggerOptions = winston.LoggerOptions;

/** default application logger */
const ApplicationLogger = (options?: LoggerOptions) => UniformLogger(createLoggerOptions(options));
type ApplicationLogger = ReturnType<typeof ApplicationLogger>;

export {
  ILogger,
  LoggerOptions,
  ApplicationLogger,
  Transports,
  UniformLogger,
  createLoggerOptions,
};
