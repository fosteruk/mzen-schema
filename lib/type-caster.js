'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectID = require('bson-objectid');

var TypeCaster = function () {
  function TypeCaster() {
    _classCallCheck(this, TypeCaster);
  }

  _createClass(TypeCaster, null, [{
    key: 'getType',

    /**
     * Get Type
     *
     * If value is a function that will be returned otherwise the values constructor will be returned.
     */
    value: function getType(value) {
      return typeof value == 'function' ? value : value.constructor;
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
    _classCallCheck(this, TypeCasterString);
  }

  _createClass(TypeCasterString, null, [{
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
    _classCallCheck(this, TypeCasterNumber);
  }

  _createClass(TypeCasterNumber, null, [{
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
    _classCallCheck(this, TypeCasterBoolean);
  }

  _createClass(TypeCasterBoolean, null, [{
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
    _classCallCheck(this, TypeCasterDate);
  }

  _createClass(TypeCasterDate, null, [{
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
    _classCallCheck(this, TypeCasterObjectID);
  }

  _createClass(TypeCasterObjectID, null, [{
    key: 'castString',
    value: function castString(value) {
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