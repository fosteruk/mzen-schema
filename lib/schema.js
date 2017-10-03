'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clone = require('clone');
var ObjectID = require('bson-objectid');
var SchemaUtil = require('./schema/util');
var Mapper = require('./schema/mapper');
var Validator = require('./schema/validator');
var Filter = require('./schema/filter');
var Types = require('./schema/types');
var TypeCaster = require('./type-caster');

var Mixed = function Mixed() {
  (0, _classCallCheck3.default)(this, Mixed);
};

var Schema = function () {
  function Schema(spec, options) {
    (0, _classCallCheck3.default)(this, Schema);

    this.spec = spec == undefined ? {} : spec;
    this.options = options == undefined ? {} : options;
    this.mapper = new Mapper(this.spec, this.options);
  }

  (0, _createClass3.default)(Schema, [{
    key: 'validate',
    value: function validate(object, options) {
      var _this = this;

      var meta = { errors: {}, root: object };
      var isArray = Array.isArray(object);
      options = options ? options : {};

      var promises = [];
      this.mapper.map(object, function (fieldSpec, fieldName, fieldContainer, path) {
        var promise = _this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then(function (value) {
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
    value: function validatePaths(paths, options, meta) {
      var _this2 = this;

      var meta = meta ? meta : { errors: {} };
      var objects = Array.isArray(paths) ? paths : [paths];
      options = options ? options : {};

      var promises = [];
      this.mapper.mapPaths(objects, function (fieldSpec, fieldName, fieldContainer, path) {
        meta['root'] = fieldContainer;
        var promise = _this2.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then(function (value) {
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
    value: function validateQuery(query, options) {
      var _this3 = this;

      var meta = meta ? meta : { errors: {} };
      options = options ? options : {};
      // This is a query - we are expecting fields which are not defined
      // - We dont want those to trigger an error so disabled strict validation
      options['strict'] = false;

      var promises = [];
      this.mapper.mapQueryPaths(query, function (path, queryPathFieldName, container) {
        var paths = {};
        paths[path] = container[queryPathFieldName];
        _this3.mapper.mapPaths(paths, function (fieldSpec, fieldName, fieldContainer, path) {
          var promise = _this3.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then(function (value) {
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
    key: 'specToFieldType',
    value: function specToFieldType(spec, value) {
      var fieldType = undefined;
      // If the field type is a string value then it should contain the string name of the required type (converted to a constructor later). 
      // - Otherwise we need to find the constructor, if the value is not already a constructor ([] or {}) 
      if (spec) {
        if (spec.constructor == String) {
          fieldType = spec;
        } else {
          fieldType = TypeCaster.getType(spec);
          if (fieldType === Object) {
            if (spec['$type'] !== undefined) {
              // The type specified in a spec object may be a constructor or a string also so this is recursive
              fieldType = this.specToFieldType(spec['$type'], value);
            }
          }
        }
      }

      if (fieldType && fieldType.constructor == String) {
        // The fieldType was specified with a String value (not a string constructor)
        // Attempt to covert the field type to a constructor
        fieldType = Types[fieldType];
      }

      return fieldType;
    }
  }, {
    key: 'validateField',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(spec, fieldName, value, path, options) {
        var meta = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

        var validators, filters, name, defaultValue, fieldType, strict, _fieldName, validateResults;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                path = path ? path : fieldName;
                validators = spec && spec['$validate'] ? spec['$validate'] : {};
                filters = spec && spec['$filter'] ? spec['$filter'] : {};
                name = spec && spec['$name'] ? spec['$name'] : fieldName;

                options = options ? options : {};

                if (!SchemaUtil.isValidFieldName(fieldName)) {
                  Schema.appendError(meta, path, 'Invalid field name');
                }

                // Configure default value filter if not already set
                defaultValue = undefined;

                if (fieldType == Object) {
                  defaultValue = {};
                } else if (fieldType == Array) {
                  defaultValue = [];
                } else if (fieldType == Types.ObjectID) {
                  defaultValue = function defaultValue() {
                    return new Types.ObjectID();
                  };
                }
                // Default value must come before type-casting - because the default value maye need to be type-casted 
                // for exmaple converting default value 'now' to type DateTime
                if (defaultValue !== undefined && filters['defaultValue'] === undefined) {
                  filters['defaultValue'] = defaultValue;
                }
                _context.next = 11;
                return Filter.filter(value, filters);

              case 11:
                value = _context.sent;
                fieldType = this.specToFieldType(spec, value);


                if (value != undefined) {
                  // We only attempt to type cast if the type was specified, the value is not null and not undefined
                  // - a type cast failure would result in an error which we do not want in the case of undefined or null
                  // - these indicate no-value, and so there is nothing to cast
                  if (fieldType && fieldType != Types.Mixed) value = this.typeCast(fieldType, value, path, meta);
                }

                if (fieldType == Object) {
                  strict = options['strict'] !== undefined ? options['strict'] : this.options['strict'];
                  // If in strict mode we must ensure there are no fields which are not defined by the spec

                  if (strict) {
                    for (_fieldName in value) {
                      if (spec[_fieldName] == undefined) {
                        Schema.appendError(meta, path + '.' + _fieldName, 'Field not specified');
                      }
                    }
                  }
                }

                // notNull can be defaulted via global option
                validators['notNull'] = validators['notNull'] !== undefined ? validators['notNull'] : this.options['defaultNotNull'];

                _context.next = 18;
                return Validator.validate(value, validators, { name: name, root: meta['root'] });

              case 18:
                validateResults = _context.sent;

                if (Array.isArray(validateResults)) {
                  validateResults.forEach(function (result) {
                    Schema.appendError(meta, path, result);
                  });
                }

                return _context.abrupt('return', value);

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function validateField(_x2, _x3, _x4, _x5, _x6) {
        return _ref.apply(this, arguments);
      }

      return validateField;
    }()
  }, {
    key: 'typeCast',
    value: function typeCast(requiredType, value, path) {
      var meta = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      // If the spec specifies the value should be an object and the value is already an object, we do not need to typecast
      // It is impossible for us to cast an object to any object type other than Object
      // When we specify a type as Object we only care that it is an Object we dont care about its 
      // specific type, we dont care if it is MyObject or YourObject
      var skip = requiredType === Object && Array.isArray(value) == false && Object(value) === value;
      var result = value;

      if (!skip) {
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