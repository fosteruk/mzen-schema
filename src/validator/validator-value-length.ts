import TypeCaster from '../type-caster';

export class ValidatorValueLength
{
  validate(value: any, options?)
  {
    const name = options && options.label ? options.label : 'field';
    const min = options && options.min ? options.min : null;
    const max = options && options.max ? options.max : null;
    const messageMin = options && options.message ? options.message : name + ' must be at least ' + min + ' characters long';
    const messageMax = options && options.message ? options.message : name + ' must be no more than ' + max + ' characters long';

    const valueType = TypeCaster.getType(value);

    const resultMin = !min || (
      (value != null) &&
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      ((valueType != Array && valueType != String) || value.length >= min) &&
      (valueType != Number || (isNaN(value) && value >= min)) &&
      (valueType != Object || Object.keys(value).length >= min)
    );

    const resultMax = !max || (
      (value == null) ||
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      ((valueType != Array && valueType != String) || value.length <= max) &&
      (valueType != Number || (isNaN(value) && value <= max)) &&
      (valueType != Object || Object.keys(value).length <= max)
    );

    const result = resultMin && resultMax ? true : (!resultMin ? messageMin : messageMax);

    return result;
  }

  getName() 
  {
    return 'valueLength';
  }
}

export default ValidatorValueLength;
