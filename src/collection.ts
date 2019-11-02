import * as Query from 'query';

export class Collection extends Array
{
  static alias:string;

  constructor(...args)
  {
    super(...args);
  }

  findAll(query:any):Array<any>
  {
    // https://github.com/protobi/query
    return Query.query(this, query, Query.undot);
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
