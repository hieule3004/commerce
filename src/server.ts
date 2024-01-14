import http from 'node:http';
import https from 'node:https';
import app from '@src/app';
import { fromEnv } from '@src/config/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { readFileSync } from '@src/utils/file';

const logger = app.get('LoggerService') as ApplicationLogger;
const port = fromEnv('PORT');

const isSecure = fromEnv('HTTP_SECURE');
const server = isSecure
  ? https.createServer(
      {
        cert: readFileSync(fromEnv('HTTP_CA_CERT')),
        key: readFileSync(fromEnv('HTTP_CA_KEY')),
        passphrase: fromEnv('HTTP_CA_PASS'),
        rejectUnauthorized: false,
      },
      app,
    )
  : http.createServer({}, app);

server.listen(port, () => {
  logger.log({ url: `${isSecure ? 'https' : 'http'}://localhost:${port}` });
});