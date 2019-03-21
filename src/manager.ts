import Schema from './schema'

export interface SchemaManagerConfig 
{
  constructors?: {[key: string]: any} | Array<any>;
  schemas?: {[key: string]: Schema} | Array<Schema>;
}

export class SchemaManager
{
  config: SchemaManagerConfig;
  constructors: {[key: string]: any};
  schemas: {[key: string]: Schema};
  
  constructor(options?: SchemaManagerConfig)
  {
    this.config = options ? options : {};
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
      // could be an array of constructor functions or a object map 
      var constructorsArray = Array.isArray(constructors) ? constructors : Object.keys(constructors).map(name => constructors[name]);
      constructorsArray.forEach(construct => {
        if (typeof construct == 'function') this.addConstructor(construct);
      });
    }
  }
  
  addSchema(schema)
  {
    if (schema && schema.getName) {
      this.schemas[schema.getName()] = schema;
    }
  }
  
  addSchemas(schemas: Array<Schema> | {[key:string]: Schema})
  {
    if (schemas) {
      // could be an array of schema objects functions or a object map
      var schemasArray = Array.isArray(schemas) ? schemas : Object.keys(schemas).map(name => schemas[name]);
      schemasArray.forEach((schema) => {
        if (schema instanceof Schema) this.addSchema(schema);
      });
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
