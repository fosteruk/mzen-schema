import TypeCaster from '../type-caster';

export class ValidatorIsEmpty
{
  validate(value: any, options?)
  {
    const label = options && options.label ? options.label : 'field';
    const message = options && options.message ? options.message : label + ' must be empty';
    const valueType = value ? TypeCaster.getType(value) : undefined;
    const result = (
      value == undefined ||
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      (valueType != Array && value == false) ||
      (valueType == Number && isNaN(value)) ||
      (valueType == Object && Object.keys(value).length == 0) ||
      (valueType == Array && value.length == 0)
    ) ? true : message;

    return result;
  }

  getName() 
  {
    return 'isEmpty';
  }
}

export default ValidatorIsEmpty;
