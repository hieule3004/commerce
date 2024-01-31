import { Router } from '@src/utils/application';

export function configureRoutes() {
  const routes = {
    HOME: createRoute('/'),
    TEST: createRoute('/test/:id'),
  };
  const { HOME, TEST } = routes;

  TEST.router.all('/sub/:name', (req, res) => {
    res.json({ params: req.params, query: req.query, body: req.body as unknown });
  });
  HOME.router.all('/hello/:idx', (_, res) => {
    res.json({ hello: 'world' });
  });
  HOME.router.get('/error', () => {
    throw new Error('error');
  });
  HOME.router.get('/', (req, res) => {
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

  return Object.values(routes);
}

function createRoute(path: string) {
  return { path, router: Router({ mergeParams: true, strict: true }) };
}
