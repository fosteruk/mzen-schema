export class ValidatorEquality
{
  validate(value: any, options?)
  {
    const name = options && options.label ? options.label : 'field';
    const root = options && options.root ? options.root : {};
    const path = options && options.path ? options.path : null;
    const message = options && options.message ? options.message : name + ' does not match';
    const result = !path || root[path] === value ? true : message;
    return result;
  }

  getName() 
  {
    return 'equality';
  }
}

export default ValidatorEquality;
