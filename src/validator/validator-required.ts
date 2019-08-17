export class ValidatorRequired
{
  // Validator function
  // - returns an error message string or an array of error messages on failure otherweise returns boolean true
  validate(value: any, options?)
  {
    const isValid = (value !== undefined);
    const name = options && options.label ? options.label : 'field';
    const message = options && options.message ? options.message : name + ' is required';
    const result = isValid ? isValid : message;
    return result;
  }

  getName() 
  {
    return 'required';
  }
}

export default ValidatorRequired;
