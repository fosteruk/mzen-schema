export interface SchemaConfig {
  name?: string;
  spec?: any;
  strict?: boolean;
  constructors?: object;
  schemas?: object;
  defaultNotNull?: boolean;
  skipTransients?: boolean;
};

export default SchemaConfig;
