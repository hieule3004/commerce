"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCodes = exports.HttpStatus = exports.HttpHeaders = void 0;
const node_http_1 = __importDefault(require("node:http"));
const node_http2_1 = __importDefault(require("node:http2"));
const HttpException_1 = require("@src/common/exceptions/HttpException");
const constants = node_http2_1.default.constants;
const ConstantsPrefixes = ['HTTP2_HEADER', 'HTTP_STATUS'];
/** HTTP status code to message map. Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */
const StatusCodes = Object.freeze(node_http_1.default.STATUS_CODES);
exports.StatusCodes = StatusCodes;
const ConstantExtract = (prefix, mapper) => {
    return Object.entries(constants).reduce((target, [k, v]) => {
        if (k.startsWith(prefix)) {
            const key = k.substring(prefix.length + 1);
            target[key] = mapper(v);
        }
        return target;
    }, {});
};
/** HTTP status enum. Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */
const HttpStatus = ConstantExtract('HTTP_STATUS', (status) => {
    const message = StatusCodes[status];
    const toException = (options = {}) => new HttpException_1.HttpException(status, options.message ?? message, options.cause);
    return { status, message, toException };
});
exports.HttpStatus = HttpStatus;
const HttpHeaders = ConstantExtract('HTTP2_HEADER', (h) => h);
exports.HttpHeaders = HttpHeaders;
