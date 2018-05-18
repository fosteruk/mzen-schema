'use strict';

const Schema = require('./schema');

class SchemaManager {
  constructor(options) {
    this.config = options == undefined ? {} : options;
    this.config.constructors = this.config.constructors ? this.config.constructors : {};
    this.config.schemas = this.config.schemas ? this.config.schemas : {};

    this.constructors = {};
    if (this.config.constructors) this.addConstructors(this.config.constructors);

    this.schemas = {};
    if (this.config.schemas) this.addSchemas(this.config.schemas);
  }
  addConstructor(value) {
    this.constructors[value.name] = value;
  }
  getConstructor(constructorName) {
    return this.constructors[constructorName] ? this.constructors[constructorName] : null;
  }
  addConstructors(constructors) {
    if (constructors) {
      if (Array.isArray(constructors)) {
        constructors.forEach(function (construct) {
          if (typeof construct == 'function') {
            this.addConstructor(construct);
          }
        }.bind(this));
      } else {
        Object.keys(constructors).forEach(function (constructorName) {
          if (typeof constructors[constructorName] == 'function') {
            this.addConstructor(constructors[constructorName]);
          }
        }.bind(this));
      }
    }
  }
  addSchema(schema) {
    if (schema && schema.getName) {
      this.schemas[schema.getName()] = schema;
    } else if (typeof schema == 'function') {
      // Schema constructor provided
      const schemaInstance = Object.create(schema);
      this.schemas[schemaInstance.getName()] = schemaInstance;
    }
  }
  addSchemas(schemas) {
    if (schemas) {
      if (Array.isArray(schemas)) {
        schemas.forEach(function (schema) {
          this.addSchema(schema);
        }.bind(this));
      } else {
        Object.keys(schemas).forEach(function (schemaName) {
          this.addSchema(schemas[schemaName]);
        }.bind(this));
      }
    }
  }
  getSchema(schemaName) {
    return this.schemas[schemaName] ? this.schemas[schemaName] : null;
  }
  async init() {
    await this.initSchemas();
    return this;
  }
  async initSchemas() {
    for (var schemaName in this.schemas) {
      const schema = this.schemas[schemaName];
      schema.addSchemas(this.schemas);
      schema.addConstructors(this.constructors);
    }
  }
}

module.exports = SchemaManager;