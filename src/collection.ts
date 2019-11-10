import * as Query from 'query';
import { ObjectPathAccessor } from './object-path-accessor';

interface FindQuery
{
  [path:string]:any;
}

interface UpdateQuery
{
  $set?:{[path:string]:any};
  $unset?:{[path:string]:boolean};
}

export class Collection extends Array
{
  static alias:string;

  constructor(...args)
  {
    super(...args);
  }

  findOne(query:FindQuery):any
  {
    const array = this.findAll(query);
    return array ? array[0] : undefined;
  }

  findAll(query:FindQuery):Collection
  {
    // https://github.com/protobi/query
    // @ts-ignore - hack to allow returning new collection of caller type
    return new (this.constructor as { new(...args): typeof Collection })(
      ...Query.query(this, query, Query.undot)
    );
  }

  update(findQuery:FindQuery|null, update:UpdateQuery)
  {
    const { $set, $unset } = update;
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? new Collection(...this) 
      : new Collection(...this.findAll(findQuery));

    collection.forEach(target => {
      if ($set) {
        Object.keys($set).forEach(path => {
          ObjectPathAccessor.setPath(path, $set[path], target);
        });
      }
      if ($unset) {
        Object.keys($unset).forEach(path => {
          if ($unset[path]) ObjectPathAccessor.unsetPath(path, target);
        });
      }
    });
  }

  delete(findQuery:FindQuery|null)
  {
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? new Collection(...this) 
      : new Collection(...this.findAll(findQuery));

    collection.forEach(item => {
      const index = this.indexOf(item);
      if (index != -1) this.splice(index, 1);
    });
  }

  replace(findQuery:FindQuery|null, newValue:any|Function)
  {
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? new Collection(...this) 
      : new Collection(...this.findAll(findQuery));

    collection.forEach(item => {
      const index = this.indexOf(item);
      if (index != -1) {
        this[index] = (typeof newValue === 'function') 
          ? newValue(this[index]) 
          : newValue;
      }
    });
  }
}
// We have to set a constructor name alias 
// - because this is lost when code is mangled
Collection.alias = 'Collection';

export default Collection;
