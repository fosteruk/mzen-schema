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
    // Could be an array of constructor functions or a object map 
    var constructorsArray = Array.isArray(constructors) ? constructors : Object.values(constructors);
    constructorsArray.forEach(construct =>  this.addConstructor(construct));
  }
  
  addSchema(schema)
  {
    this.schemas[schema.getName()] = schema;
  }
  
  addSchemas(schemas: Array<Schema> | {[key:string]: Schema})
  {
    // Could be an array of schema objects functions or a object map
    var schemasArray = Array.isArray(schemas) ? schemas : Object.values(schemas);
    schemasArray.forEach(schema => this.addSchema(schema));
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
    Object.values(this.schemas).forEach(schema => {
      schema.addSchemas(this.schemas);
      schema.addConstructors(this.constructors);
    });
  }
}

export default SchemaManager;
