import FilterInterface from './filter-interface';

export class FilterDefaultValue implements FilterInterface
{
  filter(value: any, options?)
  {
    if ((value === undefined || FilterDefaultValue.isNull(value))) {
      var defaultValue = options;
      value = (typeof defaultValue == 'function') ? defaultValue() : defaultValue;
    }
    return value;
  }

  static isNull(value)
  {
    var result = value === null || (
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null'
    );

    return result;
  }

  getName() 
  {
    return 'defaultValue';
  }
}

export default FilterDefaultValue;
