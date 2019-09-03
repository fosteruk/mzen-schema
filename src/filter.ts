import { FilterInterface } from './filter/filter-interface';
import { FilterCustom } from './filter/filter-custom';
import { FilterDefaultValue } from './filter/filter-default-value';
import { FilterLowercase } from './filter/filter-lowercase';
import { FilterTrim } from './filter/filter-trim';
import { FilterUppercase } from './filter/filter-uppercase';

export class Filter
{
  static filters = {};

  static async filter(value, filtersConfig)
  {
    var configKeys = Object.keys(filtersConfig);
    for (let x = 0; x < configKeys.length; x++) {
      let filterName = configKeys[x];
      let filter = this.filters[filterName];

      const specialFilterNames = ['private', 'privateValue'];
      if (specialFilterNames.indexOf(filterName) !== -1) continue; // Ignore special filters

      if (!filter) throw new Error('Uknown filter "' + filterName + '"');

      let filterConfig = filtersConfig[filterName];
      // If filtersConfig is an array we run the validator multiple times
      // - one for each filtersConfig object
      filterConfig = Array.isArray(filterConfig) ? filterConfig : [filterConfig];

      for (let y = 0; y < filterConfig.length; y++) {
        value = await Promise.resolve(filter.filter(value, filterConfig[y]));
      }
    }

    return value;
  }

  static addFilter(handler: FilterInterface, name?: string)
  {
    name = name ? name : handler.getName();
    this.filters[name] = handler;
  }
}

Filter.addFilter(new FilterCustom);
Filter.addFilter(new FilterDefaultValue);
Filter.addFilter(new FilterLowercase);
Filter.addFilter(new FilterTrim);
Filter.addFilter(new FilterUppercase);

export default Filter;
