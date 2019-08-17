export class ValidatorNotNull
{
  validate(value: any, options?)
  {
    const isValid = (value !== null) && !(
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null'
    );
    const name = options && options.label ? options.label : 'field';
    const message = options && options.message ? options.message : name + ' cannot be null';
    const result = isValid ? isValid : message;
    return result;
  }

  getName() 
  {
    return 'notNull';
  }
}

export default ValidatorNotNull;
