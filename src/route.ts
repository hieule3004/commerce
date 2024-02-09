import { Cache } from '@src/config/cache/cache.service';
import { Database } from '@src/config/database/database.service';
import { Application, RequestHandler } from '@src/utils/application';

export function configureRoutes(app: Application) {
  app.route('/pg').post((async (req, res) => {
    const { command, args } = req.body as { command: string; args?: unknown[] };
    res.json(
      await (app.get('Database') as Database)
        .query(command, { replacements: args!, type: command.split(' ')[0]! })
        .then((data) => ({ data }))
        .catch((error: unknown) => ({ error })),
    );
  }) as RequestHandler);

  app.route('/redis').post((async (req, res) => {
    const { command } = req.body as { command: string };
    res.json(
      await (app.get('Cache') as Cache).sendCommand(command.split(' ')).then((data) => ({ data })),
    );
  }) as RequestHandler);

  app.route('/test/:id/sub/:name').all((req, res) => {
    res.json({ params: req.params, query: req.query, body: req.body as unknown });
  });

  app.route('/hello/:idx').all((_, res) => {
    res.json({ hello: 'world' });
  });

  app.route('/error').get(() => {
    throw new Error('error');
  });

  app.route('/health').get((_, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.route('/').get((req, res) => {
    const baseURL = `${req.protocol}://${req.headers.host}`;
    res.status(200).json({
      data: {
        links: {
          self: baseURL,
          error: `${baseURL}/error`,
        },
      },
    });
  });
}
