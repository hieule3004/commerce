"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
function configureRoutes(app) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.route('/redis').post(async (req, res) => {
        const cache = app.get('Cache');
        const { command } = req.body;
        const result = await cache.sendCommand(command.split(' '));
        res.json({ result });
    });
    app.route('/test/:id/sub/:name').all((req, res) => {
        res.json({ params: req.params, query: req.query, body: req.body });
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
exports.configureRoutes = configureRoutes;
