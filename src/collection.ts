import * as Query from 'query';

export class Collection extends Array
{
  static alias:string;

  constructor(...args)
  {
    super(...args);
  }

  findAll(query:any):Collection
  {
    // https://github.com/protobi/query
    // @ts-ignore - hack to allow returning new collection of caller type
    return new (this.constructor as { new(...args): typeof Collection })(
      ...Query.query(this, query, Query.undot)
    );
  }

  findOne(query:any):any
  {
    const array = this.findAll(query);
    return array ? array[0] : undefined;
  }
}
// We have to set a constructor name alias 
// - because this is lost when code is mangled
Collection.alias = 'Collection';

export default Collection;
