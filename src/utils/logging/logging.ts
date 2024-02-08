/**---- Logger interface ----**/
type ILogger<Levels extends Record<string, string>> = {
  [K in 'log' | Levels[Extract<keyof Levels, string>]]: (
    message: unknown,
    ...optionalParams: unknown[]
  ) => void;
};

const UniformLogger = <
  LogLevelMap extends Record<string, string>,
  LogLevel extends Extract<keyof LogLevelMap, string>,
>(
  logLevelMap: LogLevelMap,
  createLogger: () => { level: string; log: (level: string, message: unknown) => void },
) => {
  const logger = createLogger();

  const _log =
    (level: LogLevel): ILogger<LogLevelMap>[LogLevelMap[LogLevel]] =>
    (message, ...optionalParams) => {
      if (message !== undefined) logger.log(level, { message, splat: optionalParams });
    };

  return Object.entries(logLevelMap).reduce(
    (target, [loglevel, methodName]) => {
      target[methodName as LogLevelMap[LogLevel]] = _log(loglevel as LogLevel);
      return target;
    },
    { log: _log(logger.level as LogLevel) } as ILogger<LogLevelMap>,
  );
};

export { ILogger, UniformLogger };
