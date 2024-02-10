import { ApplicationLogger } from '@src/config/logging/logging.utils';
import * as utils from '@src/utils/database';
import { nsid } from '@src/utils/nsid';

type LoggerOptions = { logger: ApplicationLogger; appId: string };

const Database = async (options: utils.Options, loggerOptions: LoggerOptions) => {
  const { logger, appId: id } = loggerOptions;

  const client = new utils.Database({
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

export { Database };
