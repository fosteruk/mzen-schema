export class Filter
{
  static async filter(value, filtersConfig)
  {
    var configKeys = Object.keys(filtersConfig);
    for (let x = 0; x < configKeys.length; x++) {
      let filterName = configKeys[x];
      let filter = Filter[filterName];

      var specialFilterNames = ['private', 'privateValue'];

      if (specialFilterNames.indexOf(filterName) !== -1) continue; // Ignore special filters
      if (typeof filter != 'function') throw new Error('Uknown filter "' + filterName + '"');

      let filterConfig = filtersConfig[filterName];
      // If filtersConfig is an array we run the validator multiple times
      // - one for each filtersConfig object
      filterConfig = Array.isArray(filterConfig) ? filterConfig : [filterConfig];

      for (let y = 0; y < filterConfig.length; y++) {
        value = await Promise.resolve(filter(value, filterConfig[y]));
      }
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

  static defaultValue(value, options)
  {
    if ((value === undefined || Filter.isNull(value))) {
      var defaultValue = options;
      value = (typeof defaultValue == 'function') ? defaultValue() : defaultValue;
    }
    return value;
  }

  static trim(value)
  {
    if (typeof value == 'string') value = value.trim();
    return value;
  }

  static uppercase(value)
  {
    if (typeof value == 'string') value = value.toUpperCase();
    return value;
  }

  static lowercase(value)
  {
    if (typeof value == 'string') value = value.toLowerCase();
    return value;
  }

  static custom(value, options)
  {
    var filter = options;
    if (typeof filter == 'function') value = filter(value);
    return value;
  }
}

export default Filter;
