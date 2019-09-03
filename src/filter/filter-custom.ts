import FilterInterface from './filter-interface';

export class FilterCustom implements FilterInterface
{
  filter(value: any, options?)
  {
    var filter = options;
    if (typeof filter == 'function') value = filter(value);
    return value;
  }

  getName() 
  {
    return 'custom';
  }
}

export default FilterCustom;
