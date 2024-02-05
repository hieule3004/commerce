"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = exports.levels = exports.DEFAULT_LOG_LEVEL = exports.Loglevels = void 0;
exports.Loglevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
exports.DEFAULT_LOG_LEVEL = 'INFO';
exports.levels = Object.freeze({
    FATAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5,
});
exports.colors = Object.freeze({
    FATAL: 'bold red',
    ERROR: 'red',
    WARN: 'yellow',
    INFO: 'green',
    DEBUG: 'magenta',
    TRACE: 'cyan',
});
