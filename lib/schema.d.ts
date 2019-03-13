import Mapper from './schema/mapper';
import SchemaConfig from './schema/config';
import SchemaSpec from './schema/spec';
import SchemaMapperMeta from './schema/mapper-meta';
interface SchemaValidationResult {
    errors?: object;
    isValid?: boolean;
}
export default class Schema {
    config: SchemaConfig;
    name: string;
    spec: SchemaSpec;
    constructors: object;
    schemas: object;
    mapper: Mapper | null | undefined;
    constructor(spec: SchemaSpec, options?: SchemaConfig);
    init(): void;
    getName(): string;
    setName(name: any): void;
    getSpec(): SchemaSpec;
    setSpec(spec: any): void;
    addConstructor(value: any): void;
    getConstructor(constructorName: any): any;
    addConstructors(constructors: any): void;
    addSchema(schema: any): void;
    addSchemas(schemas: any): void;
    applyTransients(object: any): any;
    stripTransients(object: any): any;
    validate(object: any, options?: SchemaConfig): Promise<SchemaMapperMeta>;
    validatePaths(paths: any, options: any, meta: any): Promise<any>;
    validateQuery(query: any, options?: SchemaConfig): Promise<any>;
    filterPrivate(object: object, mode: boolean | string, mapperType?: string): void;
    specToFieldType(spec: any, value: any): any;
    validateField(spec: SchemaSpec, fieldName: string | number, value: any, path: string | number, options?: SchemaConfig, meta?: SchemaMapperMeta): Promise<any>;
    typeCast(requiredType: any, value: any, path: any, meta?: {}): any;
    static appendError(meta: any, path: any, error: any): void;
    static isNull(value: any): boolean;
    static mergeValidationResults(results: Array<SchemaValidationResult>): SchemaValidationResult;
}
export {};
