'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require('clone');
var ObjectID = require('bson-objectid');
var Mapper = require('./schema/mapper');
var Validator = require('./schema/validator');
var Types = require('./schema/types');
var TypeCaster = require('./type-caster');

var Mixed = function Mixed() {
  _classCallCheck(this, Mixed);
};

var Schema = function () {
  function Schema(spec, options) {
    _classCallCheck(this, Schema);

    this.spec = spec == undefined ? {} : spec;
    this.options = options == undefined ? {} : options;
    this.mapper = new Mapper(this.spec, this.options);
  }

  _createClass(Schema, [{
    key: 'validate',
    value: function validate(object) {
      var _this = this;

      var meta = { errors: {}, root: object };
      var isArray = Array.isArray(object);
      var objects = isArray ? object : [object];

      var promises = [];
      this.mapper.map(objects, function (fieldSpec, fieldName, fieldContainer, path) {
        var promise = _this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, meta).then(function (value) {
          fieldContainer[fieldName] = value;
        });
        promises.push(promise);
      });

      var promise = Promise.all(promises).then(function () {
        meta.isValid = Object.keys(meta.errors).length == 0;
        return meta;
      });

      return promise;
    }
  }, {
    key: 'validatePaths',
    value: function validatePaths(paths, meta) {
      var _this2 = this;

      var meta = meta ? meta : { errors: {} };
      var objects = Array.isArray(paths) ? paths : [paths];

      var promises = [];
      this.mapper.mapPaths(objects, function (fieldSpec, fieldName, fieldContainer, path) {
        meta['root'] = fieldContainer;
        var promise = _this2.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, meta).then(function (value) {
          fieldContainer[fieldName] = value;
        });
        promises.push(promise);
      });

      var promise = Promise.all(promises).then(function () {
        meta.isValid = Object.keys(meta.errors).length == 0;
        return meta;
      });

      return promise;
    }
  }, {
    key: 'validateQuery',
    value: function validateQuery(query) {
      var _this3 = this;

      var meta = meta ? meta : { errors: {} };

      var promises = [];
      this.mapper.mapQueryPaths(query, function (path, queryPathFieldName, container) {
        var paths = {};
        paths[path] = container[queryPathFieldName];
        _this3.mapper.mapPaths(paths, function (fieldSpec, fieldName, fieldContainer, path) {
          var promise = _this3.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, meta).then(function (value) {
            container[queryPathFieldName] = value;
          });
          promises.push(promise);
        });
      });

      var promise = Promise.all(promises).then(function () {
        meta.isValid = Object.keys(meta.errors).length == 0;
        return meta;
      });

      return promise;
    }
  }, {
    key: 'filterPrivate',
    value: function filterPrivate(object, mode) {
      mode = mode ? mode : true;
      this.mapper.map(object, function (fieldSpec, fieldName, fieldContainer, path) {
        var filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
        if (filters['private'] === true || filters['private'] == mode) {
          delete fieldContainer[fieldName];
        }
      });
    }
  }, {
    key: 'filterPrivatePaths',
    value: function filterPrivatePaths(paths, mode) {
      mode = mode ? mode : true;
      var objects = Array.isArray(paths) ? paths : [paths];

      this.mapper.mapPaths(objects, function (fieldSpec, fieldName, fieldContainer, path) {
        var filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
        if (filters['private'] === true || filters['private'] == mode) {
          delete fieldContainer[fieldName];
        }
      });
    }
  }, {
    key: 'validateField',
    value: function validateField(spec, fieldName, value, path) {
      var meta = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      path = path ? path : fieldName;
      var validators = spec && spec['$validate'] ? spec['$validate'] : {};
      var filters = spec && spec['$filter'] ? spec['$filter'] : {};
      var name = spec && spec['$name'] ? spec['$name'] : fieldName;

      var fieldType = undefined;
      // If the field type is a string value then it should contain the string name of the required type (converted to a constructor later). 
      // - Otherwise we need to find the constructor, if the value is not already a constructor ([] or {}) 
      if (spec) fieldType = spec.constructor == String ? spec : TypeCaster.getType(spec);
      if (fieldType == Object && spec['$type'] !== undefined) fieldType = spec['$type'];

      if (fieldType && fieldType.constructor == String) {
        // The fieldType was specified with a String value (not a string constructor)
        // Attempt to covert the field type to a constructor
        fieldType = Types[fieldType];
      }

      // notNull can be defaulted via global option
      validators['notNull'] = validators['notNull'] !== undefined ? validators['notNull'] : this.options['defaultNotNull'];

      var defaultValue = filters['defaultValue'];
      if (defaultValue === undefined) {
        if (fieldType == Object) {
          defaultValue = {};
        } else if (fieldType == Array) {
          defaultValue = [];
        } else if (fieldType == Types.ObjectID) {
          defaultValue = function defaultValue() {
            return new Types.ObjectID();
          };
        }
      }

      if ((value === undefined || Schema.isNull(value)) && defaultValue !== undefined) {
        value = typeof defaultValue == 'function' ? defaultValue() : defaultValue;
      }

      if (!Number.isInteger(fieldName) && !Schema.isValidFieldName(fieldName)) {
        Schema.appendError(meta, path, 'Invalid field name');
      }

      if (value != undefined) {
        // We only attempt to type cast if the type was specified, the value is not null and not undefined
        // - a type cast failure would result in an error which we do not want in the case of undefined or null
        // - these indicate no-value, and so there is nothing to cast
        if (fieldType && fieldType != Types.Mixed) value = this.typeCast(fieldType, value, path, meta);
      }

      if (fieldType == Object) {
        // If in strict mode we must ensure there are no fields which are not defined by the spec
        if (this.options['strict']) {
          for (var _fieldName in value) {
            if (spec[_fieldName] == undefined) {
              Schema.appendError(meta, path + '.' + _fieldName, 'Field not specified');
            }
          }
        }
      }

      var promise = Validator.validate(value, validators, name, meta['root']);
      return promise.then(function (validateResults) {
        if (Array.isArray(validateResults)) {
          validateResults.forEach(function (result) {
            Schema.appendError(meta, path, result);
          });
        }
        return value;
      });
    }
  }, {
    key: 'typeCast',
    value: function typeCast(requiredType, value, path) {
      var meta = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var result = value;
      var requiredTypeName = TypeCaster.getTypeName(requiredType);
      var valueTypeName = TypeCaster.getTypeName(value);

      // We compare type names rather than constructors 
      // - because sometimes we need to treat two different implentations as the same type
      // - An exmaple of this is ObjectID type. MongoDB has its own implementation which should
      // - be considered the same type as ObjectID implementation used by Schema (bson-objectid)
      if (requiredTypeName != valueTypeName) {
        result = TypeCaster.cast(requiredType, value);

        var resultTypeName = TypeCaster.getTypeName(result);
        if (
        // We failed to convert to the specified type
        resultTypeName != requiredTypeName ||
        // We converted to type 'number' but the result was NaN so its invalid
        valueTypeName != 'Number' && resultTypeName == 'Number' && isNaN(result)) {
          var origValue = ['String', 'Number', 'Boolean'].indexOf(valueTypeName) != -1 ? "'" + value + "'" : '';
          Schema.appendError(meta, path, origValue + ' of type ' + valueTypeName + ' cannot be cast to type ' + requiredTypeName);
        }
      }

      return result;
    }
  }], [{
    key: 'appendError',
    value: function appendError(meta, path, error) {
      var errors = Array.isArray(meta.errors[path]) ? meta.errors[path] : [];
      errors.push(error);
      meta.errors[path] = errors;
    }
  }, {
    key: 'isNull',
    value: function isNull(value) {
      var result = value === null ||
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null';

      return result;
    }
  }, {
    key: 'isValidFieldName',
    value: function isValidFieldName(fieldName) {
      var valid = true;
      if (valid && fieldName.charAt(0) == '$') valid = false;
      return valid;
    }
  }, {
    key: 'mergeValidationResults',
    value: function mergeValidationResults(results) {
      results = Array.isArray(results) ? results : [];
      var finalResult = { errors: {} };
      results.forEach(function (result, x) {
        if (result.errors) Object.assign(finalResult.errors, result.errors);
      });
      finalResult.isValid = Object.keys(finalResult.errors).length == 0;
      return finalResult;
    }
  }]);

  return Schema;
}();

module.exports = Schema;