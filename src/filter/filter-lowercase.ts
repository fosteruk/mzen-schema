import FilterInterface from './filter-interface';

export class FilterLowercase implements FilterInterface
{
  filter(value: any, _options?)
  {
    if (typeof value == 'string') value = value.toLowerCase();
    return value;
  }

  getName() 
  {
    return 'lowercase';
  }
}

export default FilterLowercase;
