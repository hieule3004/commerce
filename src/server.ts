import { configureApplication } from '@src/app';
import { Config } from '@src/config/env/config.service';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { createServer } from '@src/utils/http/server';
import { readFileSync } from '@src/utils/node/fs';

void (async function bootstrap() {
  const app = await configureApplication();

  const config = app.get('Config') as Config;
  const logger = app.get('Logger') as ApplicationLogger;
  const id = app.get('AppId') as string;

  const isSecure = config.fromEnv('API_HTTP_SECURE');
  const server = createServer(
    {
      tls: isSecure
        ? {
            cert: readFileSync(config.fromEnv('API_HTTP_CA_CERT') as string),
            key: readFileSync(config.fromEnv('API_HTTP_CA_KEY') as string),
            passphrase: config.fromEnv('API_HTTP_CA_PASS'),
            rejectUnauthorized: false,
          }
        : undefined,
    },
    app,
  );

  const port = config.fromEnv('API_PORT');
  server.on('error', (error) => {
    if ((error as { code?: string }).code === 'EADDRINUSE') return server.close(serveCallback);
    throw error;
  });
  server.listen(port, serveCallback);

  function serveCallback() {
    const url = `${isSecure ? 'https' : 'http'}://localhost:${port}`;
    logger.log({ id, type: 'serve', data: { url } });
  }
})();
