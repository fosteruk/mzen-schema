import { Schema } from './schema';

export class SchemaInquisitor
{
  schema:Schema;
  
  constructor(schema:Schema)
  {
    this.schema = schema;
  }
  
  getValidValues(path:string)
  {
    let result = undefined;
    // This method inspects the schema validation options
    // - to file what are the valid values of any inArray validation
    const spec = this.schema.getMapper().getSpecPath(path);

    if (
      spec 
      && spec.$validate 
      && spec.$validate.inArray 
      && spec.$validate.inArray.values
    ) {
      result = spec.$validate.inArray.values;
    }

    return result;
  }

  getValidValueLengthMin(path:string)
  {
    let result = undefined;
    // This method inspects the schema validation options
    // - to file what are the valid values of any inArray validation
    const spec = this.schema.getMapper().getSpecPath(path);

    if (
      spec 
      && spec.$validate 
      && spec.$validate.valueLength 
      && spec.$validate.valueLength.min !== undefined
    ) {
      result = spec.$validate.valueLength.min;
    }

    return result;
  }

  getValidValueLengthMax(path:string)
  {
    let result = undefined;
    // This method inspects the schema validation options
    // - to file what are the valid values of any inArray validation
    const spec = this.schema.getMapper().getSpecPath(path);

    if (
      spec 
      && spec.$validate 
      && spec.$validate.valueLength 
      && spec.$validate.valueLength.max !== undefined
    ) {
      result = spec.$validate.valueLength.max;
    }

    return result;
  }
}

export default SchemaInquisitor;
