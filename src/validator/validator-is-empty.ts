import TypeCaster from '../type-caster';

export class ValidatorIsEmpty
{
  validate(value: any, _options?)
  {
    var valueType = value ? TypeCaster.getType(value) : undefined;
    var result = (
      value == undefined ||
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      (valueType != Array && value == false) ||
      (valueType == Number && isNaN(value)) ||
      (valueType == Object && Object.keys(value).length == 0) ||
      (valueType == Array && value.length == 0)
    );
    return result;
  }

  getName() 
  {
    return 'isEmpty';
  }
}

export default ValidatorIsEmpty;
