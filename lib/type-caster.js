'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectID = require('bson-objectid');

var TypeCaster = function () {
  function TypeCaster() {
    (0, _classCallCheck3.default)(this, TypeCaster);
  }

  (0, _createClass3.default)(TypeCaster, null, [{
    key: 'getType',

    /**
     * Get Type
     *
     * If value is a function that will be returned otherwise the values constructor will be returned.
     */
    value: function getType(value) {
      return typeof value == 'function' ? value : value === null || value === undefined ? value : value.constructor;
    }
  }, {
    key: 'getTypeName',
    value: function getTypeName(value) {
      return TypeCaster.getType(value).name;
    }
  }, {
    key: 'cast',
    value: function cast(toType, value) {
      var fromTypeName = TypeCaster.getTypeName(value);
      var fromTypeCaster = TypeCaster.type[fromTypeName];
      if (fromTypeCaster == undefined) throw new Error('Can not cast from unknown type "' + fromTypeName + '"');

      var toTypeName = TypeCaster.getTypeName(toType);
      var toTypeCaster = TypeCaster.type[TypeCaster.getTypeName(toType)];
      if (toTypeCaster == undefined) throw new Error('Can not cast to unknown type "' + toTypeName + '"');

      var result = value;
      // If there is a cast function for toType then we cast the value
      // - otherwise the case is not supported so we simply return the original value
      var castFunctionName = TypeCaster.getCastFunctionName(fromTypeName);
      //console.log(toTypeName, toType, castFunctionName);
      if (typeof toTypeCaster[castFunctionName] == 'function') {
        result = toTypeCaster[castFunctionName](value);
      }

      return result;
    }
  }, {
    key: 'getCastFunctionName',
    value: function getCastFunctionName(typeName) {
      return 'cast' + typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  }]);
  return TypeCaster;
}();

var TypeCasterString = function () {
  function TypeCasterString() {
    (0, _classCallCheck3.default)(this, TypeCasterString);
  }

  (0, _createClass3.default)(TypeCasterString, null, [{
    key: 'castNumber',
    value: function castNumber(value) {
      return value.toString();
    }
  }, {
    key: 'castBoolean',
    value: function castBoolean(value) {
      return value ? '1' : '0';
    }
  }, {
    key: 'castObjectID',
    value: function castObjectID(value) {
      return value.toString();
    }
  }]);
  return TypeCasterString;
}();

var TypeCasterNumber = function () {
  function TypeCasterNumber() {
    (0, _classCallCheck3.default)(this, TypeCasterNumber);
  }

  (0, _createClass3.default)(TypeCasterNumber, null, [{
    key: 'castString',
    value: function castString(value) {
      return +value;
    }
  }, {
    key: 'castBoolean',
    value: function castBoolean(value) {
      return value ? 1 : 0;
    }
  }]);
  return TypeCasterNumber;
}();

var TypeCasterBoolean = function () {
  function TypeCasterBoolean() {
    (0, _classCallCheck3.default)(this, TypeCasterBoolean);
  }

  (0, _createClass3.default)(TypeCasterBoolean, null, [{
    key: 'castString',
    value: function castString(value) {
      value = value.trim().toLowerCase();
      return value == '1' || value == 'true';
    }
  }, {
    key: 'castNumber',
    value: function castNumber(value) {
      return value > 0;
    }
  }]);
  return TypeCasterBoolean;
}();

var TypeCasterDate = function () {
  function TypeCasterDate() {
    (0, _classCallCheck3.default)(this, TypeCasterDate);
  }

  (0, _createClass3.default)(TypeCasterDate, null, [{
    key: 'castString',
    value: function castString(value) {
      var result = undefined;
      if (value == '' || value.toLowerCase() == 'now') {
        result = new Date();
      } else {
        result = new Date(value);
      }
      return result;
    }
  }, {
    key: 'castNumber',
    value: function castNumber(value) {
      return new Date(value);
    }
  }]);
  return TypeCasterDate;
}();

var TypeCasterObjectID = function () {
  function TypeCasterObjectID() {
    (0, _classCallCheck3.default)(this, TypeCasterObjectID);
  }

  (0, _createClass3.default)(TypeCasterObjectID, null, [{
    key: 'castString',
    value: function castString(value) {
      // The string 'new' can be used request a new object id
      value = value == 'new' ? undefined : value;
      return ObjectID(value);
    }
  }]);
  return TypeCasterObjectID;
}();

TypeCaster.type = {
  String: TypeCasterString,
  Number: TypeCasterNumber,
  Boolean: TypeCasterBoolean,
  Object: {}, // Object is a valid type but we can not cast a primitive to an object so it has no cast methods
  Array: {}, // Array is a valid type but we can not cast a primitive to an object so it has no cast methods
  Date: TypeCasterDate,
  ObjectID: TypeCasterObjectID // This is a mongodb specific type
};

module.exports = TypeCaster;