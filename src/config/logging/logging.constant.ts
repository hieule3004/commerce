export const Loglevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'] as const;

export type Loglevel = (typeof Loglevels)[number];

export const DEFAULT_LOG_LEVEL = 'INFO' satisfies Loglevel;

export const levels = Object.freeze({
  FATAL: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
}) satisfies Record<Loglevel, number>;

export const colors = Object.freeze({
  FATAL: 'bold red',
  ERROR: 'red',
  WARN: 'yellow',
  INFO: 'green',
  DEBUG: 'magenta',
  TRACE: 'cyan',
}) satisfies Record<Loglevel, string>;
