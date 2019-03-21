import Schema from './schema';

export interface SchemaConfig {
  name?: string;
  spec?: any;
  strict?: boolean;
  constructors?: {[key:string]: any} | Array<any>;
  schemas?: {[key:string]: Schema} | Array<Schema>;
  defaultNotNull?: boolean;
  skipTransients?: boolean;
};

export default SchemaConfig;
