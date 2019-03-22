import ObjectID from 'bson-objectid';

class Mixed {}

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
