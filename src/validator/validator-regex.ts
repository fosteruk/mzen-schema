export class ValidatorRegex
{
  validate(value: any, options?)
  {
    const name = options && options.label ? options.label : 'field';
    const regex = options && options.pattern ? new RegExp(options.pattern) : new RegExp('');
    const message = options && options.message ? options.message : name + ' does not appear to be valid';
    const result = regex.test(value) ? true : message;
    return result;
  }
  
  getName() 
  {
    return 'regex';
  }
}

export default ValidatorRegex;
