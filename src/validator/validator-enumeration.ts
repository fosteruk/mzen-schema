export class ValidatorEnumeration
{
  validate(value: any, options?)
  {
    var name = options && options.label ? options.label : 'field';
    var values = options && options.values ? options.values : [];
    var message = options && options.message ? options.message : name + ' is invalid';
    return (Array.isArray(values) && values.indexOf(value) !== -1) || message;
  }

  getName() 
  {
    return 'enumeration';
  }
}

export default ValidatorEnumeration;
