"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_objectid_1 = require("bson-objectid");
class Mixed {
}
const Types = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object,
    Date: Date,
    ObjectID: bson_objectid_1.default,
    Mixed: Mixed
};
exports.default = Types;
//# sourceMappingURL=types.js.map