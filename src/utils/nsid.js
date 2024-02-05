"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nsid = exports.isValid = exports.decodeTime = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const ulidx_1 = require("ulidx");
Object.defineProperty(exports, "decodeTime", { enumerable: true, get: function () { return ulidx_1.decodeTime; } });
Object.defineProperty(exports, "isValid", { enumerable: true, get: function () { return ulidx_1.isValid; } });
/** nearly-sorted identifier */
const nsid = (input) => {
    if (!input)
        return (0, ulidx_1.ulid)();
    if ((0, ulidx_1.isValid)(input))
        return input;
    throw new TypeError(`Invalid id: ${input}`);
};
exports.nsid = nsid;
