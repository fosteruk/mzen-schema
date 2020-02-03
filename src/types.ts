import ObjectID from 'bson-objectid';

class Mixed {}

// @ts-ignore
String.alias = 'String';
// @ts-ignore
Number.alias = 'Number';
// @ts-ignore
Boolean.alias = 'Boolean';
// @ts-ignore
Array.alias = 'Array';
// @ts-ignore
Object.alias = 'Object';
// @ts-ignore
Date.alias = 'Date';
// @ts-ignore
ObjectID.alias = 'ObjectID';
// @ts-ignore
Mixed.alias = 'Mixed';

export const SchemaTypes = {
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Date: Date,
  ObjectID: ObjectID,
  Mixed: Mixed
};

export default SchemaTypes;
