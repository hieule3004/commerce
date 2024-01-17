import { Application } from '@src/utils/application';

export function configureRoute(app: Application) {
  app.get('/error', () => {
    throw new Error('error');
  });
  app.get('/', (req, res) => {
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