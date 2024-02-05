"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggerOptions = exports.UniformLogger = exports.Transports = exports.ApplicationLogger = void 0;
const node_util_1 = __importDefault(require("node:util"));
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const serialisation_1 = require("@src/utils/serialisation");
const logging_constant_1 = require("./logging.constant");
const { cli, combine, errors, json, logstash, printf, splat, timestamp } = winston_1.default.format;
const UniformLogger = (loggerOptions) => {
    const logger = winston_1.default.createLogger(loggerOptions);
    const _log = (level) => (message, ...optionalParams) => {
        if (message !== undefined)
            logger.log(level, { message, splat: optionalParams });
    };
    return logging_constant_1.Loglevels.reduce((target, loglevel) => {
        target[loglevel.toLowerCase()] = _log(loglevel);
        return target;
    }, { log: _log('INFO') });
};
exports.UniformLogger = UniformLogger;
const jsonFmt = (message) => typeof message === 'object' ? JSON.stringify(message) : message;
const strFmt = (colors) => (message) => {
    if (typeof message !== 'object')
        return message;
    const formatKey = colors ? (k) => `\x1b[36m${k}\x1b[m` : (k) => k;
    const inspectOptions = { depth: null, compact: true, breakLength: Infinity, colors };
    return Object.entries(message)
        .map(([k, v]) => `${formatKey(k)}=${node_util_1.default.formatWithOptions(inspectOptions, v)}`)
        .join(' ');
};
const message = (format) => printf((info) => {
    let value = format(info.message);
    let e = info;
    if (e?.stack)
        for (let i = 0; e; e = e.cause, i++)
            value += `\n[${i}] ${String(e.stack)}`;
    info.message = value;
    return info.message;
});
const Formats = {
    console: combine(errors({ stack: true }), timestamp(), message(strFmt(true)), splat(), cli({ colors: logging_constant_1.colors, levels: logging_constant_1.levels }), printf((info) => `${info.timestamp} ${info.level} ${info.message}`)),
    file: combine(errors({ stack: true }), timestamp(), message(jsonFmt), splat(), json({ replacer: (0, serialisation_1.redact)((k) => k === 'splat') }), logstash()),
};
const Transports = Object.freeze({
    console: () => new winston_1.default.transports.Console({
        format: Formats.console,
    }),
    file: () => new winston_1.default.transports.File({
        format: Formats.file,
        dirname: 'logs/service',
        filename: `${new Date().toISOString()}.log`,
    }),
    dailyRotateFile: () => new winston_daily_rotate_file_1.default({
        format: Formats.file,
        dirname: 'logs/service',
        filename: `%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
});
exports.Transports = Transports;
/** create logger options with default parameters */
const createLoggerOptions = (options) => ({
    levels: logging_constant_1.levels,
    level: logging_constant_1.DEFAULT_LOG_LEVEL,
    transports: [Transports.console(), Transports.dailyRotateFile()],
    ...options,
});
exports.createLoggerOptions = createLoggerOptions;
/** default application logger */
const ApplicationLogger = (options) => UniformLogger(createLoggerOptions(options));
exports.ApplicationLogger = ApplicationLogger;
