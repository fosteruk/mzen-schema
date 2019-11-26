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

// Extending Array doesnt really work in as you might expect
// - becaused JavaScript uses prototypal inheritance
// - the Array returned by mutator methods is always Array 
// - rather than the extended object type.
// - https://blog.simontest.net/extend-array-with-typescript-965cc1134b3
// Understanding this we match this behaviour
// - always returning Array type from mutators
export class Collection<T> extends Array<T>
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

  // This is called findAll() and not find() as in mongodb
  // -because we are extending array and array already provides find()
  findAll(query:FindQuery):Array<any>
  {
    return Query.query(this, query, Query.undotArray);
  }

  update(findQuery:FindQuery|null, update:UpdateQuery):Array<T>
  {
    const { $set, $unset } = update;
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? this 
      : this.findAll(findQuery);

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

    return collection;
  }

  delete(findQuery:FindQuery|null):Array<T>
  {
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? this 
      : this.findAll(findQuery);

    collection.forEach(item => {
      const index = this.indexOf(item);
      if (index != -1) this.splice(index, 1);
    });

    return collection;
  }

  replace(findQuery:FindQuery|null, newValue:any|Function):Array<T>
  {
    const collection = !findQuery || Object.keys(findQuery).length == 0 
      ? this
      : this.findAll(findQuery);

    collection.forEach(item => {
      const index = this.indexOf(item);
      if (index != -1) {
        this[index] = (typeof newValue === 'function') 
          ? newValue(this[index]) 
          : newValue;
      }
    });

    return collection;
  }
}
// We have to set a constructor name alias 
// - because this is lost when code is mangled
Collection.alias = 'Collection';

export default Collection;
