"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logData = exports.logRequest = void 0;
const semver_1 = require("semver");
const dotenv_1 = require("@src/config/dotenv");
const http_constant_1 = require("@src/config/http/http.constant");
const http_1 = require("@src/utils/http");
const logRequest = (req, res, next) => {
    const logger = req.app.get('LoggerService');
    const requestDto = buildRequestLog(req, res, next);
    logger.log(requestDto);
    const $ = res.json;
    res.json = function (data) {
        const responseDto = buildResponseLog(res);
        logger.log(responseDto);
        return $.call(this, data);
    };
    next();
};
exports.logRequest = logRequest;
const logData = function (req, res, next) {
    const logger = req.app.get('LoggerService');
    const id = req.headers[http_constant_1.X_REQUEST_ID];
    const sid = req.sessionID;
    const $ = res.json;
    res.json = function (data) {
        if ('error' in data)
            logger.debug({ id, sid, type: 'error', ...data });
        else
            logger.debug({ id, sid, type: 'data', data });
        return $.call(this, data);
    };
    next();
};
exports.logData = logData;
const isV5 = () => (0, semver_1.major)((0, semver_1.minVersion)((0, dotenv_1.fromEnv)('npm_package_dependencies_express'))) === 5;
function buildRequestLog(req, res, next) {
    const id = req.headers[http_constant_1.X_REQUEST_ID];
    const v5 = isV5();
    const routerName = v5 ? 'router' : '_router';
    const layerHandleProp = v5 ? 'handleRequest' : 'handle_request';
    const baseHandleName = v5 ? 'handle' : 'bound dispatch';
    const params = {};
    const router = req.app[routerName];
    const prototype = Object.getPrototypeOf(router.stack[0]);
    const handleRequest = prototype[layerHandleProp];
    prototype[layerHandleProp] = function (req, res, next) {
        if (this.name === baseHandleName)
            return Object.assign(params, req.params);
        if (this.name === 'router')
            this.handle(req, res, next);
        next();
    };
    router.handle(req, res, next);
    prototype[layerHandleProp] = handleRequest;
    const route = req.route;
    if (!route)
        throw http_1.HttpStatus.NOT_FOUND.toException();
    const path = route.path;
    const sid = req.sessionID;
    const { method, url, query } = req;
    const { body } = req;
    return { id, sid, type: 'request', data: { method, url, path, params, query, body } };
}
function buildResponseLog(res) {
    const id = res.getHeader(http_constant_1.X_REQUEST_ID);
    const sid = res.req.sessionID;
    const code = res.statusCode;
    const message = res.statusMessage ?? http_1.StatusCodes[code];
    const responseTime = Date.now() - Number(res.req.headers[http_constant_1.X_REQUEST_TIMESTAMP]);
    return { id, sid, type: 'response', data: { code, message, responseTime } };
}
