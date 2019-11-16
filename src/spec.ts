
export interface SchemaSpec 
{
  $type?: any;
  $spec?: SchemaSpec;
  $pathRef?: string;
  $construct?: any;
  $filter?: SchemaSpecFilter;
  $validate?: SchemaSpecValidate;
  $label?: string;
  $strict?: boolean;
  // The nullable flag indicates that an object can have a null value
  // All other non array values can be null regardless 
  // - unless specifically configured as notNull via $validate config
  $nullable?: boolean;
  [key: string]: SchemaSpec | any;
}

export interface SchemaSpecFilter
{
  trim?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  defaultValue?: any;
  custom?: (value: any) => boolean|string;
  private?: boolean;
  privateValue?: boolean;
}

export interface SchemaSpecValidate
{
  notNull?: boolean | SchemaSpecValidateOptions,
  required?: boolean | SchemaSpecValidateOptions
  notEmpty?: boolean | SchemaSpecValidateOptions,
  email?: boolean | SchemaSpecValidateOptions,
  valueLength?: SchemaSpecValidateOptionsValueLength | Array<SchemaSpecValidateOptionsValueLength>,
  equality?: SchemaSpecValidateOptionsEquality | Array<SchemaSpecValidateOptionsEquality>,
  enumeration?: SchemaSpecValidateOptionsEnumeration,
  regex?: SchemaSpecValidateOptionsRegex | Array<SchemaSpecValidateOptionsRegex>
}

export interface SchemaSpecValidateOptions
{
  name?: string;
  message?: string;
}

export interface SchemaSpecValidateOptionsValueLength extends SchemaSpecValidateOptions
{
  min?: number;
  max?: number;
}

export interface SchemaSpecValidateOptionsEquality extends SchemaSpecValidateOptions
{
  path: string;
  root: any;
}

export interface SchemaSpecValidateOptionsEnumeration extends SchemaSpecValidateOptions
{
  values?: Array<any>;
}

export interface SchemaSpecValidateOptionsRegex extends SchemaSpecValidateOptions
{
  pattern?: any;
}

export default SchemaSpec;
