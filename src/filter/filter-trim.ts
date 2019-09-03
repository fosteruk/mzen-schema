import FilterInterface from './filter-interface';

export class FilterTrim implements FilterInterface
{
  filter(value: any, _options?)
  {
    if (typeof value == 'string') value = value.trim();
    return value;
  }

  getName() 
  {
    return 'trim';
  }
}

export default FilterTrim;
