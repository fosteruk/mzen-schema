'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectID = require('bson-objectid');

var Mixed = function Mixed() {
  _classCallCheck(this, Mixed);
};

var Types = {
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