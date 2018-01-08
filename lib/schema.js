'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require('clone');
var ObjectID = require('bson-objectid');
var SchemaUtil = require('./schema/util');
var Mapper = require('./schema/mapper');
var Validator = require('./schema/validator');
var Filter = require('./schema/filter');
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
      var deleteRefs = [];
      this.mapper.map(object, function (fieldSpec, fieldName, fieldContainer, path) {
        var filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
        if (filters['private'] === true || filters['private'] == mode) {
          // We cant simply delete here because if we delete a parent of a structure we are already
          // - iterating we will get errors. Instead make a list of references to delete.
          // Once we have all the references we can safely delete them.
          deleteRefs.push({ fieldContainer: fieldContainer, fieldName: fieldName });
        }
      });

      deleteRefs.forEach(function (ref) {
        if (ref.fieldContainer && ref.fieldContainer[ref.fieldName]) delete ref.fieldContainer[ref.fieldName];
      });
    }
  }, {
    key: 'filterPrivatePaths',
    value: function filterPrivatePaths(paths, mode) {
      mode = mode ? mode : true;
      var objects = Array.isArray(paths) ? paths : [paths];
      var deleteRefs = [];
      this.mapper.mapPaths(objects, function (fieldSpec, fieldName, fieldContainer, path) {
        var filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
        if (filters['private'] === true || filters['private'] == mode) {
          // We cant simply delete here because if we delete a parent of a structure we are already
          // - iterating we will get errors. Instead make a list of references to delete.
          // Once we have all the references we can safely delete them.
          deleteRefs.push({ fieldContainer: fieldContainer, fieldName: fieldName });
        }
      });

      deleteRefs.forEach(function (ref) {
        if (ref.fieldContainer && ref.fieldContainer[ref.fieldName]) delete ref.fieldContainer[ref.fieldName];
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
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(spec, fieldName, value, path, options) {
        var meta = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

        var validators, filters, name, fieldType, defaultValue, strict, _fieldName, validateResults;

        return regeneratorRuntime.wrap(function _callee$(_context) {
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

                fieldType = this.specToFieldType(spec, value);

                // Configure default value filter if not already set

                defaultValue = filters['defaultValue'];

                if (fieldType == Object) {
                  defaultValue = {};
                } else if (fieldType == Array) {
                  defaultValue = [];
                } else if (fieldName == '_id' && fieldType == Types.ObjectID) {
                  defaultValue = function defaultValue() {
                    return new Types.ObjectID();
                  };
                }
                // Default value must be applied before type-casting - because the default value may need to be type-casted
                // - for exmaple converting default value 'now' to type Date

                if (!(defaultValue !== undefined)) {
                  _context.next = 13;
                  break;
                }

                _context.next = 12;
                return Filter.filter(value, { defaultValue: defaultValue });

              case 12:
                value = _context.sent;

              case 13:

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

                // Apply filters
                _context.next = 17;
                return Filter.filter(value, filters);

              case 17:
                value = _context.sent;


                // notNull can be defaulted via global option
                validators['notNull'] = validators['notNull'] !== undefined ? validators['notNull'] : this.options['defaultNotNull'];

                _context.next = 21;
                return Validator.validate(value, validators, { name: name, root: meta['root'] });

              case 21:
                validateResults = _context.sent;

                if (Array.isArray(validateResults)) {
                  validateResults.forEach(function (result) {
                    Schema.appendError(meta, path, result);
                  });
                }

                return _context.abrupt('return', value);

              case 24:
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