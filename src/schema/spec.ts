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
  $validate?: {
    notNull?: boolean | {name?: string, message?: string},
    required?: boolean | {name?: string, message?: string},
    notEmpty?: boolean | {name?: string, message?: string},
    email?: boolean | {name?: string, message?: string},
    valueLength?: {min?: number, max?: number, name?: string, message?: string} ,
    equality?: {path: string, root: any, name?: string, message?: string},
    enumeration?: {values?: Array<any>, name?: string, message?: string}
  }
  $displayName?: string,
  $strict?: boolean,
  [key: string]: SchemaSpec | any
}

export default SchemaSpec;
