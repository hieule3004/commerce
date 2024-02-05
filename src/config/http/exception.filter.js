"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionFilter = void 0;
const HttpException_1 = require("@src/common/exceptions/HttpException");
const exceptionFilter = (err, _, res, next) => {
    const exception = err instanceof HttpException_1.HttpException ? err : new HttpException_1.HttpException(500, err);
    const e = buildErrorResponse(exception);
    res.status(exception.getStatus()).json(e);
    next();
};
exports.exceptionFilter = exceptionFilter;
function buildErrorResponse(exception) {
    const code = exception.getStatus();
    const descOrErr = exception.getResponse();
    const message = typeof descOrErr === 'string' ? descOrErr : descOrErr.message;
    const meta = descOrErr instanceof Error ? descOrErr : exception.cause;
    return { error: { code, message, meta } };
}
