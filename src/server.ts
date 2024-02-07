import http from 'node:http';
import https from 'node:https';
import { configureApplication } from '@src/app';
import { Config } from '@src/config/env/config.service';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { readFileSync } from '@src/utils/file';

void (async function bootstrap() {
  const app = await configureApplication();

  const config = app.get('Config') as Config;
  const logger = app.get('Logger') as ApplicationLogger;
  const id = app.get('AppId') as string;

  const isSecure = config.fromEnv('HTTP_SECURE');
  const server = isSecure
    ? https.createServer(
        {
          cert: readFileSync(config.fromEnv('HTTP_CA_CERT') as string),
          key: readFileSync(config.fromEnv('HTTP_CA_KEY') as string),
          passphrase: config.fromEnv('HTTP_CA_PASS'),
          rejectUnauthorized: false,
        },
        app,
      )
    : http.createServer({}, app);

  const port = config.fromEnv('PORT');
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
