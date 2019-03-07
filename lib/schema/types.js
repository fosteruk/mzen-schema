'use strict';

var ObjectID = require('bson-objectid');

class Mixed {}

const Types = {
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Date: Date,
  ObjectID: ObjectID,
  Mixed: Mixed
};
module.exports = Types;