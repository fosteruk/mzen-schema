export class ValidatorInArray
{
  validate(value: any, options?)
  {
    var name = options && options.label ? options.label : 'field';
    var values = options && options.values ? options.values : [];
    var message = options && options.message ? options.message : name + ' is invalid';
    return (Array.isArray(values) && values.includes(value)) || message;
  }

  getName() 
  {
    return 'inArray';
  }
}

export default ValidatorInArray;
