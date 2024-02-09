import sequelize from 'sequelize';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { nsid } from '@src/utils/nsid';

type DatabaseOptions = sequelize.Options;
type LoggerOptions = { logger: ApplicationLogger; appId: string };

const Database = async (options: DatabaseOptions, loggerOptions: LoggerOptions) => {
  const { logger, appId: id } = loggerOptions;

  const client = new sequelize.Sequelize({
    ...options,
    ['logging']: (sql, timing) =>
      // TODO: get id from context
      logger.trace({ id: nsid(), type: 'query', data: { sql, timing } }),
  });
  await client.authenticate({ logging: false }).then(
    () => logger.log({ id, type: 'database', data: { client: 'pg', message: 'connected' } }),
    (e: Error) =>
      logger.error({ id, type: 'database', error: { client: 'pg', message: e.message } }),
  );
  return client;
};
type Database = Awaited<ReturnType<typeof Database>>;

const DataTypes = sequelize.DataTypes;

export { DataTypes, Database };
