interface SchemaManagerConfig {
    constructors: object;
    schemas: object;
}
export default class SchemaManager {
    config: SchemaManagerConfig;
    constructors: object;
    schemas: object;
    constructor(options: any);
    addConstructor(value: any): void;
    getConstructor(constructorName: any): any;
    addConstructors(constructors: any): void;
    addSchema(schema: any): void;
    addSchemas(schemas: any): void;
    getSchema(schemaName: any): any;
    init(): Promise<this>;
    initSchemas(): Promise<void>;
}
export {};
