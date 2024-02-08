import util from 'node:util';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { UniformLogger } from '@src/utils/logging/logging';
import { redact } from '@src/utils/serialisation';
import { DEFAULT_LOG_LEVEL, Loglevel, Loglevels, colors, levels } from './logging.constant';

const { cli, combine, errors, json, logstash, printf, splat, timestamp } = winston.format;

/**---- Logger options ----**/

type MessageFormat = <M = unknown>(message: M) => string;
type ErrInfo = { cause?: ErrInfo; stack?: unknown };

const jsonFmt: MessageFormat = (message) =>
  typeof message === 'object' ? JSON.stringify(message) : (message as string);

const strFmt: (colors: boolean) => MessageFormat = (colors) => (message) => {
  if (typeof message !== 'object') return message as string;
  const formatKey = colors ? (k: string) => `\x1b[36m${k}\x1b[m` : (k: string) => k;
  const inspectOptions = { depth: null, compact: true, breakLength: Infinity, colors };
  return Object.entries(message as object)
    .map(([k, v]) => `${formatKey(k)}=${util.formatWithOptions(inspectOptions, v)}`)
    .join(' ');
};

const message = (format: (message: unknown) => string) =>
  printf((info) => {
    let value = format(info.message);
    let e = info as ErrInfo | undefined;
    if (e?.stack) for (let i = 0; e; e = e.cause, i++) value += `\n[${i}] ${String(e.stack)}`;

    info.message = value;
    return info.message as string;
  });

const Formats = {
  console: combine(
    errors({ stack: true }),
    timestamp(),
    message(strFmt(true)),
    splat(),
    cli({ colors, levels }),
    printf((info) => `${info.timestamp} ${info.level} ${info.message}`),
  ),
  file: combine(
    errors({ stack: true }),
    timestamp(),
    message(jsonFmt),
    splat(),
    json({ replacer: redact((k) => k === 'splat') }),
    logstash(),
  ),
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

const logLevelMethodMap = Loglevels.reduce(
  (t, l) => Object.assign(t, { [l]: l.toLowerCase() }),
  {} as { [K in Loglevel]: Lowercase<K> },
);

type LoggerOptions = winston.LoggerOptions;

/** default application logger */
const ApplicationLogger = (options?: LoggerOptions) =>
  UniformLogger(logLevelMethodMap, 'INFO', () =>
    winston.createLogger(createLoggerOptions(options)),
  );
type ApplicationLogger = ReturnType<typeof ApplicationLogger>;

export { LoggerOptions, ApplicationLogger, Transports, createLoggerOptions };
