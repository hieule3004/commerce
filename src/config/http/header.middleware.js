"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCustomHeader = void 0;
const http_constant_1 = require("@src/config/http/http.constant");
const nsid_1 = require("@src/utils/nsid");
const addCustomHeader = (req, res, next) => {
    // set custom request id
    const requestId = (0, nsid_1.nsid)();
    req.headers[http_constant_1.X_REQUEST_ID] = requestId;
    res.setHeader(http_constant_1.X_REQUEST_ID, requestId);
    // set custom request timestamp
    req.headers[http_constant_1.X_REQUEST_TIMESTAMP] = String((0, nsid_1.decodeTime)(requestId));
    next();
};
exports.addCustomHeader = addCustomHeader;
