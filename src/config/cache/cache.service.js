"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const redis_1 = require("redis");
const dotenv_1 = require("@src/config/dotenv");
const Cache = async () => {
    const client = (0, redis_1.createClient)({
        url: (0, dotenv_1.fromEnv)('REDIS_URL'),
    });
    return await client.connect();
};
exports.Cache = Cache;
