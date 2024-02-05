"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnv = exports.fromEnv = void 0;
const node_process_1 = __importDefault(require("node:process"));
const zod_1 = require("zod");
const logging_constant_1 = require("@src/config/logging/logging.constant");
const convert_1 = require("@src/utils/math/convert");
const systemSchema = zod_1.z.object({
    npm_package_name: zod_1.z.string().min(1),
    npm_package_dependencies_express: zod_1.z.string().min(1),
});
const serverSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive(),
    LOG_LEVEL: zod_1.z.enum(logging_constant_1.Loglevels).default('INFO'),
});
const httpSchema = zod_1.z.object({
    HTTP_REQUEST_SIZE_LIMIT: zod_1.z
        .union([zod_1.z.string().regex(/^\d+[kmgtp]?b$/i), zod_1.z.number().int().positive()])
        .default((0, convert_1.convert)(5, 'MB').to('B')),
    HTTP_REQUEST_RATE_LIMIT: zod_1.z.coerce.number().int().positive().default(100),
    HTTP_REQUEST_RATE_LIMIT_WINDOW_MS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default((0, convert_1.convert)(1, 'min').to('ms')),
});
const httpSecureSchema = zod_1.z
    .object({
    HTTP_SECURE: zod_1.z
        .enum(['true', 'false'])
        .transform((s) => s === 'true')
        .default('false'),
    HTTP_CA_CERT: zod_1.z.string().min(1).optional(),
    HTTP_CA_KEY: zod_1.z.string().min(1).optional(),
    HTTP_CA_PASS: zod_1.z.string().min(1).optional(),
})
    .refine((e) => !e.HTTP_SECURE || (e.HTTP_CA_CERT && e.HTTP_CA_KEY && e.HTTP_CA_PASS), {
    message: 'Missing variables when feature is on: HTTP_SECURE',
});
const cookieSchema = zod_1.z.object({
    API_SESSION_NAME: zod_1.z.string().min(1),
    API_SESSION_KEYS: zod_1.z.string().transform((s) => s.split(',')),
    API_SESSION_EXPIRY_MS: zod_1.z.coerce.number().int().positive().default((0, convert_1.convert)(1, 'h').to('ms')),
});
const redisSchema = zod_1.z.object({
    REDIS_URL: zod_1.z.string().url(),
});
/** DotEnv schema */
const dotEnvValidator = systemSchema
    .and(serverSchema)
    .and(httpSchema)
    .and(httpSecureSchema)
    .and(cookieSchema)
    .and(redisSchema);
const parseEnv = (env) => {
    const result = dotEnvValidator.safeParse(env);
    if (!result.success) {
        console.error(result.error.format());
        node_process_1.default.exit(1);
    }
    return result.data;
};
exports.parseEnv = parseEnv;
/** DotEnv object */
const dotEnv = parseEnv(node_process_1.default.env);
/** Get environment variable */
const fromEnv = (key) => dotEnv[key];
exports.fromEnv = fromEnv;
