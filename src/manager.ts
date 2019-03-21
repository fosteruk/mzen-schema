interface SchemaManagerConfig {
  constructors: object;
  schemas: object;
}

export class SchemaManager
{
  config: SchemaManagerConfig;
  constructors: {[key: string]: any};
  schemas: {[key: string]: any};
  
  constructor(options?)
  {
    this.config = (options == undefined) ? {} : options;
    this.config.constructors = this.config.constructors ? this.config.constructors : {};
    this.config.schemas = this.config.schemas ? this.config.schemas : {};

    this.constructors = {};
    if (this.config.constructors) this.addConstructors(this.config.constructors);

    this.schemas = {};
    if (this.config.schemas) this.addSchemas(this.config.schemas);
  }
  
  addConstructor(value)
  {
    this.constructors[value.alias ? value.alias : value.name] = value;
  }
  
  getConstructor(constructorName)
  {
    return this.constructors[constructorName] ? this.constructors[constructorName] : null;
  }
  
  addConstructors(constructors)
  {
    if (constructors) {
      if (Array.isArray(constructors)) {
        constructors.forEach((construct) => {
          if (typeof construct == 'function') {
            this.addConstructor(construct);
          }
        });
      } else {
        Object.keys(constructors).forEach((constructorName) => {
          if (typeof constructors[constructorName] == 'function') {
            this.addConstructor(constructors[constructorName]);
          }
        });
      }
    }
  }
  
  addSchema(schema)
  {
    if (schema && schema.getName) {
      this.schemas[schema.getName()] = schema;
    }
  }
  
  addSchemas(schemas)
  {
    if (schemas) {
      if (Array.isArray(schemas)) {
        schemas.forEach((schema) => {
          this.addSchema(schema);
        });
      } else {
        Object.keys(schemas).forEach((schemaName) => {
          this.addSchema(schemas[schemaName]);
        });
      }
    }
  }
  
  getSchema(schemaName)
  {
    return this.schemas[schemaName] ? this.schemas[schemaName] : null;
  }
  
  async init()
  {
    await this.initSchemas();
    return this;
  }
  
  async initSchemas()
  {
    for (var schemaName in this.schemas) {
      const schema = this.schemas[schemaName];
      schema.addSchemas(this.schemas);
      schema.addConstructors(this.constructors);
    }
  }
}

export default SchemaManager;
