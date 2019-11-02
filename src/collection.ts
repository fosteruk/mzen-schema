import * as Query from 'query';

export class Collection extends Array
{
  static alias:string;

  constructor(...args)
  {
    super(...args);
  }

  query(q) 
  { 
    // https://github.com/protobi/query
    return Query.query(this, q, Query.undot); 
  }
}
// We have to set a constructor name alias 
// - because this is lost when code is mangled
Collection.alias = 'Collection';

export default Collection;
