"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var random_1 = require("@src/utils/random");
var serialisation_1 = require("@src/utils/serialisation");
describe('serialisation', function () {
    var data = { name: random_1.default.name(), value: random_1.default.integer() };
    it('can redact key', function () {
        var replacer = (0, serialisation_1.redact)(function (k) { return k === 'name'; });
        var str = JSON.stringify(data, replacer);
        var value = JSON.parse(str);
        expect(value.name).toBeUndefined();
    });
});
