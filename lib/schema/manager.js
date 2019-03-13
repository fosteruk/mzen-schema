"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaManager {
    constructor(options) {
        this.config = (options == undefined) ? {} : options;
        this.config.constructors = this.config.constructors ? this.config.constructors : {};
        this.config.schemas = this.config.schemas ? this.config.schemas : {};
        this.constructors = {};
        if (this.config.constructors)
            this.addConstructors(this.config.constructors);
        this.schemas = {};
        if (this.config.schemas)
            this.addSchemas(this.config.schemas);
    }
    addConstructor(value) {
        this.constructors[value.alias ? value.alias : value.name] = value;
    }
    getConstructor(constructorName) {
        return this.constructors[constructorName] ? this.constructors[constructorName] : null;
    }
    addConstructors(constructors) {
        if (constructors) {
            if (Array.isArray(constructors)) {
                constructors.forEach((construct) => {
                    if (typeof construct == 'function') {
                        this.addConstructor(construct);
                    }
                });
            }
            else {
                Object.keys(constructors).forEach((constructorName) => {
                    if (typeof constructors[constructorName] == 'function') {
                        this.addConstructor(constructors[constructorName]);
                    }
                });
            }
        }
    }
    addSchema(schema) {
        if (schema && schema.getName) {
            this.schemas[schema.getName()] = schema;
        }
    }
    addSchemas(schemas) {
        if (schemas) {
            if (Array.isArray(schemas)) {
                schemas.forEach((schema) => {
                    this.addSchema(schema);
                });
            }
            else {
                Object.keys(schemas).forEach((schemaName) => {
                    this.addSchema(schemas[schemaName]);
                });
            }
        }
    }
    getSchema(schemaName) {
        return this.schemas[schemaName] ? this.schemas[schemaName] : null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initSchemas();
            return this;
        });
    }
    initSchemas() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var schemaName in this.schemas) {
                const schema = this.schemas[schemaName];
                schema.addSchemas(this.schemas);
                schema.addConstructors(this.constructors);
            }
        });
    }
}
exports.default = SchemaManager;
