"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.serveStatic = exports.Application = void 0;
const express_1 = __importDefault(require("express"));
const Application = () => (0, express_1.default)();
exports.Application = Application;
var express_2 = require("express");
Object.defineProperty(exports, "serveStatic", { enumerable: true, get: function () { return express_2.static; } });
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return express_2.Router; } });
