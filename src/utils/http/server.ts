import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';

const createServer = (
  serverOptions: http.ServerOptions & {
    tls: (tls.SecureContextOptions & tls.TlsOptions) | undefined;
  },
  requestListener: http.RequestListener,
) =>
  serverOptions.tls
    ? https.createServer({ ...serverOptions, ...serverOptions.tls }, requestListener)
    : http.createServer(serverOptions, requestListener);

export { createServer };
