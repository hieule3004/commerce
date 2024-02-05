"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
const http_1 = require("@src/utils/http");
class HttpException extends Error {
    status;
    response;
    cause;
    constructor(status, response, cause) {
        super(typeof response === 'string' ? response : http_1.StatusCodes[status], { cause });
        this.status = status;
        this.response = response;
        this.cause = cause;
    }
    getStatus() {
        return this.status;
    }
    getResponse() {
        return this.response;
    }
}
exports.HttpException = HttpException;
