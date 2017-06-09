'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require('clone');
var ObjectID = require('bson-objectid');
var SchemaUtil = require('./util');
var Types = require('./types');
var TypeCaster = require('../type-caster');

var SchemaMapper = function () {
  function SchemaMapper(spec, options) {
    _classCallCheck(this, SchemaMapper);

    this.spec = spec == undefined ? {} : spec;
    this.options = options == undefined ? {} : options;
  }

  _createClass(SchemaMapper, [{
    key: 'map',
    value: function map(object, callback) {
      var meta = { path: '', errors: {} };
      var isArray = Array.isArray(object);
      var objects = isArray ? object : [object];
      // Clone the spec as it may be temporarily modified in the process of validation
      var spec = clone(this.spec);

      objects.forEach(function (object, x) {
        this.mapField(spec, x, objects, meta, callback);
      }, this);
    }
  }, {
    key: 'mapPaths',
    value: function mapPaths(paths, callback, meta) {
      var meta = meta ? meta : { path: '', errors: {} };
      var objects = Array.isArray(paths) ? paths : [paths];

      meta['path'] = meta['path'] ? meta['path'] : '';
      objects.forEach(function (object) {
        for (var fieldPath in object) {
          if (!object.hasOwnProperty(fieldPath)) continue;
          meta['path'] = fieldPath;
          var spec = SchemaUtil.getSpec(fieldPath, this.spec);
          this.mapField(spec, fieldPath, object, meta, callback);
        }
      }.bind(this));
    }
  }, {
    key: 'mapQueryPaths',
    value: function mapQueryPaths(query, callback) {
      var mapRecursive = function mapRecursive(query) {
        if (TypeCaster.getType(query) == Object) {
          var _loop = function _loop(fieldName) {
            if (!query.hasOwnProperty(fieldName)) return 'continue';
            if (SchemaUtil.isQueryOperator(fieldName)) {
              if (SchemaUtil.canValidateQueryOperator(childField)) {
                // If this element is an operator - we want to validate is values
                if (['$or', '$and'].indexOf(fieldName) != -1) {
                  query[fieldName].forEach(function (value, x) {
                    mapRecursive(query[fieldName][x]);
                  });
                } else {
                  mapRecursive(query[fieldName]);
                }
              }
            } else {
              // Check if has a query opterator
              hasOpertators = false;

              if (TypeCaster.getType(query[fieldName]) == Object) {
                for (childField in query[fieldName]) {
                  hasOpertators = hasOpertators || SchemaUtil.isQueryOperator(childField);
                  if (hasOpertators && SchemaUtil.canValidateQueryOperator(childField)) {
                    if (Array.isArray(query[fieldName][childField])) {
                      query[fieldName][childField].forEach(function (value, x) {
                        callback(fieldName, x, query[fieldName][childField]);
                      });
                    } else {
                      callback(fieldName, childField, query[fieldName]);
                    }
                  }
                }
              }
              if (!hasOpertators) {
                if (Array.isArray(query[fieldName])) {
                  query[fieldName].forEach(function (value, x) {
                    callback(fieldName, x, query[fieldName]);
                  });
                } else {
                  callback(fieldName, fieldName, query);
                }
              }
            }
          };

          for (var fieldName in query) {
            var hasOpertators;
            var childField;

            var _ret = _loop(fieldName);

            if (_ret === 'continue') continue;
          }
        } else if (Array.isArray(query)) {
          query.forEach(function (arrayValue, x) {
            mapRecursive(query[x], meta);
          });
        }
        return query;
      };

      mapRecursive(query);
    }
  }, {
    key: 'mapRecursive',
    value: function mapRecursive(spec, object) {
      var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = arguments[3];

      meta['path'] = meta['path'] == undefined ? '' : meta['path'];

      // If match all spec is defined, newSpec defaults to an empty object since any spec rules should be replaced by 
      // - the match-all spec (defaults to original spec)
      var matchAllSpec = spec && spec['*'] != undefined ? spec['*'] : undefined;
      var newSpec = matchAllSpec != undefined ? {} : spec;
      for (var fieldName in object) {
        if (!object.hasOwnProperty(fieldName)) continue;

        if (matchAllSpec !== undefined) {
          // If match all '*' field spec is set, we generate a new spec object using the match all spec for every field
          newSpec[fieldName] = matchAllSpec;
        } else if (spec === undefined || spec[fieldName] === undefined) {
          // Any properties of the object under validation, that are not defined defined in the spec
          // - are injected into the spec as "undefined" to allow default validations to be applied
          // If no spec is specified, all fields are set as undefined. This allows default validations to be applied.
          newSpec[fieldName] = undefined;
        }
      }
      spec = newSpec;

      var basePath = meta['path'];

      for (var fieldName in spec) {
        if (!spec.hasOwnProperty(fieldName)) continue;
        if (SchemaUtil.isQueryOperator(fieldName)) continue; // Descriptor proptery
        meta['path'] = basePath ? basePath + '.' + fieldName : fieldName;
        this.mapField(spec[fieldName], fieldName, object, meta, callback);
      }
    }
  }, {
    key: 'mapArrayElements',
    value: function mapArrayElements(spec, array) {
      var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = arguments[3];

      meta['path'] = meta['path'] == undefined ? '' : meta['path'];

      var basePath = meta['path'];

      array.forEach(function (element, x) {
        meta['path'] = basePath + '.' + x;
        this.mapField(spec, x, array, meta, callback);
      }, this);
    }
  }, {
    key: 'mapField',
    value: function mapField(spec, fieldName, container) {
      var meta = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var callback = arguments[4];

      meta['path'] = meta['path'] == undefined ? '' : meta['path'];

      var fieldType = undefined;
      // If the field type is a string value then it should contain the string name of the required type (converted to a constructor later). 
      // - Otherwise we need to find the constructor, if the value is not already a constructor ([] or {}) 
      if (spec) fieldType = spec.constructor == String ? spec : TypeCaster.getType(spec);
      if (fieldType == Object && spec['$type'] !== undefined) fieldType = spec['$type'];
      if (fieldType && fieldType.constructor == String) {
        // The fieldType was specified with a string value (not a String constructor)
        // Attempt to covert the field type to a constructor
        fieldType = Types[fieldType];
      }

      var defaultValue = undefined;
      if (fieldType == Object) {
        defaultValue = {};
      } else if (fieldType == Array) {
        defaultValue = [];
      }
      if (container[fieldName] === undefined && defaultValue !== undefined) {
        container[fieldName] = defaultValue;
      }

      callback(spec, fieldName, container, meta['path']);

      var path = meta['path'];
      switch (fieldType) {
        case Object:
          this.mapRecursive(spec, container[fieldName], meta, callback);
          break;
        case Array:
          var arraySpec = undefined;
          if (Array.isArray(spec) && spec[0]) {
            // If the field is an array the specification for the array elements shoud be contained in the first element
            arraySpec = spec[0];
          } else if (TypeCaster.getType(spec) == Object && spec['$spec']) {
            // If the field type is an object which specifies type "Array" 
            // - then the array elements spec should be specified using the "$spec" property 
            arraySpec = spec['$spec'];
          }
          if (arraySpec && container[fieldName]) {
            this.mapArrayElements(arraySpec, container[fieldName], meta, callback);
          }
          break;
      }
    }
  }]);

  return SchemaMapper;
}();

module.exports = SchemaMapper;