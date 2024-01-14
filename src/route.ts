import express from 'express';

export function configureRoute(app: express.Express) {
  app.get('/error', () => {
    throw new Error('error');
  });
  app.get('/', (req, res) => {
    const baseURL = `${req.protocol}://${req.headers.host}`;
    res.status(200).json({
      links: {
        self: baseURL,
        error: `${baseURL}/error`,
      },
    });
  });
}