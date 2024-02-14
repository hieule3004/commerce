import { Cache } from '@src/config/cache/cache.service';
import { Database } from '@src/config/database/database.service';
import { VersionInfo } from '@src/config/version';
import { Application, Layer, asyncHandler } from '@src/utils/application';
import { getSharedIdempotencyService } from '@src/utils/application/middleware';

export function configureRoutes(app: Application) {
  app.route('/test').post((req, res) => {
    const idempotencyService = getSharedIdempotencyService();
    const isHit = idempotencyService.isHit(req);
    const idempotencyKey = idempotencyService.extractIdempotencyKeyFromReq(req);
    res.json({ isHit, idempotencyKey });
  });
  app.route('/pg').post(
    asyncHandler(async (req, res) => {
      const { command, args } = req.body as { command: string; args?: unknown[] };
      res.json(
        await (app.get('Database') as Database)
          .query(command, { replacements: args!, type: command.split(' ')[0]! })
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error })),
      );
    }),
  );

  app.route('/redis').post(
    asyncHandler(async (req, res) => {
      const { command } = req.body as { command: string };
      res.json(
        await (app.get('Cache') as Cache)
          .sendCommand(command.split(' '))
          .then((data) => ({ data })),
      );
    }),
  );

  app.route('/error').get(() => {
    throw new Error('error');
  });

  app.route('/health').get((_, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.route('/').get((req, res) => {
    const { propName } = req.app.get('VersionInfo') as VersionInfo;

    const baseURL = `${req.protocol}://${req.headers.host}`;
    const data = (req.app[propName.router] as unknown as Layer).stack
      .filter((layer) => layer.name === propName.baseHandle)
      .map((layer) => ({
        method: Object.keys(layer.route!.methods)[0]!.toUpperCase(),
        path: `${baseURL}${layer.route!.path}`,
      }));

    res.status(200).json({ data });
  });
}
