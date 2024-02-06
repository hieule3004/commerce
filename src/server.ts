import http from 'node:http';
import https from 'node:https';
import { configureApplication } from '@src/app';
import { JsonDto } from '@src/common/dtos/json.dto';
import { fromEnv } from '@src/config/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { readFileSync } from '@src/utils/file';

void (async function bootstrap() {
  const app = await configureApplication();

  const logger = app.get('LoggerService') as ApplicationLogger;
  const id = app.get('AppId') as string;
  const port = fromEnv('PORT');

  const isSecure = fromEnv('HTTP_SECURE');
  const server = isSecure
    ? https.createServer(
        {
          cert: readFileSync(fromEnv('HTTP_CA_CERT') as string),
          key: readFileSync(fromEnv('HTTP_CA_KEY') as string),
          passphrase: fromEnv('HTTP_CA_PASS'),
          rejectUnauthorized: false,
        },
        app,
      )
    : http.createServer({}, app);

  server.listen(port, () => {
    const url = `${isSecure ? 'https' : 'http'}://localhost:${port}`;
    logger.log({ id, type: 'start', data: { url } } as JsonDto);
  });
})();
