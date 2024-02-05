"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplication = void 0;
const connect_redis_1 = __importDefault(require("connect-redis"));
const cache_service_1 = require("@src/config/cache/cache.service");
const dotenv_1 = require("@src/config/dotenv");
const exception_filter_1 = require("@src/config/http/exception.filter");
const header_middleware_1 = require("@src/config/http/header.middleware");
const logging_middleware_1 = require("@src/config/logging/logging.middleware");
const logging_utils_1 = require("@src/config/logging/logging.utils");
const route_1 = require("@src/route");
const application_1 = require("@src/utils/application");
const middleware_1 = require("@src/utils/application/middleware");
const http_1 = require("@src/utils/http");
const nsid_1 = require("@src/utils/nsid");
async function createApplication() {
    const app = (0, application_1.Application)();
    app.set('LoggerService', (0, logging_utils_1.ApplicationLogger)({ level: (0, dotenv_1.fromEnv)('LOG_LEVEL') }));
    app.set('Cache', await (0, cache_service_1.Cache)());
    configureMiddleware(app);
    return app;
}
exports.createApplication = createApplication;
function configureMiddleware(app) {
    const cache = app.get('Cache');
    app.use((0, application_1.serveStatic)('public'));
    app.use((0, middleware_1.cors)({}));
    app.use((0, middleware_1.helmet)());
    // app.disable('X-Powered-By'.toLowerCase());
    app.use((0, middleware_1.methodOverride)());
    app.use((0, middleware_1.compression)());
    app.set('query parser', 'extended');
    const limit = (0, dotenv_1.fromEnv)('HTTP_REQUEST_SIZE_LIMIT');
    app.use((0, middleware_1.json)({ limit }));
    app.use((0, middleware_1.urlencoded)({ extended: true, limit }));
    app.use((0, middleware_1.cookieParser)((0, dotenv_1.fromEnv)('API_SESSION_KEYS')));
    // express session, setup after cookie session to avoid session modify
    // Reference: https://davidburgos.blog/expressjs-session-error-req-session-touch-not-function
    app.set('trust proxy', 1);
    app.use((0, middleware_1.session)({
        store: new connect_redis_1.default({ client: cache, prefix: `${(0, dotenv_1.fromEnv)('npm_package_name')}:session:` }),
        name: (0, dotenv_1.fromEnv)('API_SESSION_NAME'),
        secret: (0, dotenv_1.fromEnv)('API_SESSION_KEYS'),
        cookie: { maxAge: (0, dotenv_1.fromEnv)('API_SESSION_EXPIRY_MS') },
        genid: () => (0, nsid_1.nsid)(),
        resave: true,
        saveUninitialized: true,
    }));
    app.use((0, middleware_1.rateLimit)({
        windowMs: (0, dotenv_1.fromEnv)('HTTP_REQUEST_RATE_LIMIT_WINDOW_MS'),
        limit: (0, dotenv_1.fromEnv)('HTTP_REQUEST_RATE_LIMIT'),
        handler: () => {
            throw http_1.HttpStatus.TOO_MANY_REQUESTS.toException();
        },
        standardHeaders: true,
    }));
    // custom middleware
    app.use(header_middleware_1.addCustomHeader);
    app.use(logging_middleware_1.logRequest);
    app.use(logging_middleware_1.logData);
    // routing
    (0, route_1.configureRoutes)(app);
    // exception filter
    app.use(exception_filter_1.exceptionFilter);
}
