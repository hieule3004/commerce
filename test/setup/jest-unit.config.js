"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var jest_config_1 = require("./jest.config");
module.exports = __assign(__assign({}, jest_config_1.default), { testRegex: '.*\\.spec\\.ts$', collectCoverageFrom: ['**/*.(t|j)s'], coverageDirectory: '<rootDir>/coverage', cache: false });
