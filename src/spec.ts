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

export interface SchemaSpec 
{
  $type?: any,
  $spec?: SchemaSpec,
  $pathRef?: string,
  $construct?: any,
  $filter?: {
    trim?: boolean,
    uppercase?: boolean,
    lowercase?: boolean,
    defaultValue?: any,
    custom?: (value: any) => boolean|string,
    private?: boolean,
    privateValue?: boolean
  },
  $validate?: SchemaSpecValidate,
  $displayName?: string,
  $strict?: boolean,
  [key: string]: SchemaSpec | any
}

export default SchemaSpec;
