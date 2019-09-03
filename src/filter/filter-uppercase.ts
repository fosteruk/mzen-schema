import FilterInterface from './filter-interface';

export class FilterUppercase implements FilterInterface
{
  filter(value: any, _options?)
  {
    if (typeof value == 'string') value = value.toUpperCase();
    return value;
  }

  getName() 
  {
    return 'uppercase';
  }
}

export default FilterUppercase;
