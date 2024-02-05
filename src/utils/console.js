"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_util_1 = __importDefault(require("node:util"));
const options = { showHidden: false, depth: null, colors: true };
const log = (message, ...params) => {
    console.log(node_util_1.default.formatWithOptions(options, message, ...params));
};
exports.default = { ...console, log };
