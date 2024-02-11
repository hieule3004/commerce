import { ApplicationLogger } from '@src/config/logging/logging.config';
import { Options, Sequelize } from '@src/utils/database';
import { nsid } from '@src/utils/nsid';

type LoggerOptions = { logger: ApplicationLogger; appId: string };

const Database = async (options: Options, loggerOptions: LoggerOptions) => {
  const { logger, appId: id } = loggerOptions;

  const client = new Sequelize({
    ...options,
    // TODO: get id from context
    ['logging']: (sql) => logger.trace({ id: nsid(), type: 'query', data: { sql } }),
  });
  await client.authenticate({ logging: false }).then(
    () => logger.log({ id, type: 'database', data: { client: 'pg', message: 'connected' } }),
    (e: Error) =>
      logger.error({ id, type: 'database', error: { client: 'pg', message: e.message } }),
  );
  return client;
};
type Database = Sequelize;

export { Database };
