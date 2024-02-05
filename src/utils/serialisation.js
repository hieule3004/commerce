"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redact = void 0;
/** {@link JSON.stringify} replacer function to redact sensitive information */
const redact = (test, format) => (key, value) => test(key) ? format?.(key, value) : value;
exports.redact = redact;
