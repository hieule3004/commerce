"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const app_1 = require("@src/app");
const dotenv_1 = require("@src/config/dotenv");
const file_1 = require("@src/utils/file");
const nsid_1 = require("@src/utils/nsid");
const bootstrap = async () => {
    const app = await (0, app_1.createApplication)();
    const logger = app.get('LoggerService');
    const port = (0, dotenv_1.fromEnv)('PORT');
    const isSecure = (0, dotenv_1.fromEnv)('HTTP_SECURE');
    const server = isSecure
        ? node_https_1.default.createServer({
            cert: (0, file_1.readFileSync)((0, dotenv_1.fromEnv)('HTTP_CA_CERT')),
            key: (0, file_1.readFileSync)((0, dotenv_1.fromEnv)('HTTP_CA_KEY')),
            passphrase: (0, dotenv_1.fromEnv)('HTTP_CA_PASS'),
            rejectUnauthorized: false,
        }, app)
        : node_http_1.default.createServer({}, app);
    server.listen(port, () => {
        const url = `${isSecure ? 'https' : 'http'}://localhost:${port}`;
        logger.log({ id: (0, nsid_1.nsid)(), type: 'start', data: { url } });
    });
};
void bootstrap();
