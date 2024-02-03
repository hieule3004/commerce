import { Cache } from '@src/config/cache/cache.service';
import { Application } from '@src/utils/application';

export function configureRoutes(app: Application) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.route('/redis').post(async (req, res) => {
    const cache = app.get('Cache') as Cache;
    const { command } = req.body as { command: string };
    const result = await cache.sendCommand(command.split(' '));
    res.json({ result });
  });
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
