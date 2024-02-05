"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const HttpException_1 = require("@src/common/exceptions/HttpException");
const http_1 = require("@src/utils/http");
class ValidationException extends HttpException_1.HttpException {
    constructor(cause) {
        super(http_1.HttpStatus.BAD_REQUEST.status, 'Validation failed', cause);
    }
}
exports.ValidationException = ValidationException;
