import SchemaConfig from './config';
import SchemaSpec from './spec';
import SchemaMapperMeta from './mapper-meta';
interface SchemaMapperCallback {
    (spec: SchemaSpec, fieldName: string | number, container: object, metaPath: string, meta: object): void;
}
export interface SchemaMapperMappingConfig {
    skipTransients?: boolean;
}
export default class SchemaMapper {
    config: SchemaConfig;
    spec: SchemaSpec;
    specNormalised: SchemaSpec | null | undefined;
    schemas: object;
    constructor(spec: SchemaSpec, options?: SchemaConfig);
    init(): void;
    getSpec(): SchemaSpec;
    addSchema(schema: any): void;
    addSchemas(schemas: any): void;
    normalizeSpec(spec: any): any;
    map(data: Array<object> | object, callback: SchemaMapperCallback, options?: SchemaMapperMappingConfig): any;
    mapPaths(paths: object, callback: SchemaMapperCallback, options?: object, meta?: SchemaMapperMeta): void;
    mapQueryPaths(query: any, callback: any, options?: {}): void;
    mapRecursive(spec: SchemaSpec, object: object, callback: SchemaMapperCallback, options?: SchemaMapperMappingConfig, meta?: SchemaMapperMeta): void;
    mapArrayElements(spec: SchemaSpec, array: Array<any>, callback: SchemaMapperCallback, options?: SchemaMapperMappingConfig, meta?: SchemaMapperMeta): void;
    mapField(spec: SchemaSpec, fieldName: string | number, container: object, callback: SchemaMapperCallback, options: SchemaMapperMappingConfig, meta?: SchemaMapperMeta): any;
    initPath(path: any): any;
    static specIsTransient(spec: any): boolean;
}
export {};
