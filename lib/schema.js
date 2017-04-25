'use strict'
var clone = require('clone');
var ObjectID = require('bson-objectid');
var Mapper = require('./schema/mapper');
var Validator = require('./schema/validator');
var TypeCaster = require('./type-caster');

class Mixed {}

class Schema
{
  constructor(spec, options) 
  {
    this.spec = (spec == undefined) ? {} : spec;
    this.options = (options == undefined) ? {} : options;
    this.mapper = new Mapper(this.spec, this.options);
  }
  validate(object)
  {
    var meta = {path: '', errors: {}, root: object};
    var isArray = Array.isArray(object);
    var objects = isArray ? object : [object];

    this.mapper.map(objects, (fieldSpec, fieldName, fieldContainer, path) => {
      meta['path'] = path;
      fieldContainer[fieldName] = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], meta);
    });

    meta.isValid = (Object.keys(meta.errors).length == 0);
    return meta;
  }
  validatePaths(paths, meta)
  {
    var meta = meta ? meta : {path: '', errors: {}};
    var objects = Array.isArray(paths) ? paths : [paths];

    this.mapper.mapPaths(objects, (fieldSpec, fieldName, fieldContainer, path) => {
      meta['path'] = path;
      meta['root'] = fieldContainer;
      fieldContainer[fieldName] = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], meta);
    });
    
    meta.isValid = (Object.keys(meta.errors).length == 0);
    return meta;
  }
  validateQuery(query)
  {
    var meta = meta ? meta : {path: '', errors: {}};

    this.mapper.mapQueryPaths(query, (path, queryPathFieldName, container) => {
      var paths = {};
      paths[path] = container[queryPathFieldName];
      this.mapper.mapPaths(paths, (fieldSpec, fieldName, fieldContainer, path) => {
        container[queryPathFieldName] = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], meta);
      });
    });

    meta.isValid = (Object.keys(meta.errors).length == 0);
    return meta;
  }
  stripPrivateFields(object, mode)
  {
    mode = mode ? mode : true;
    this.mapper.map(object, (fieldSpec, fieldName, fieldContainer, path) => {
      const filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
      if (filters['private'] === true || filters['private'] == mode){
        delete fieldContainer[fieldName];
      }
    });
  }
  validateField(spec, fieldName, value, meta = {})
  {
    meta['path'] = (meta['path'] == undefined) ? fieldName : meta['path'];
    
    var fieldType = undefined;
    // If the field type is a string value then it should contain the string name of the required type (converted to a constructor later). 
    // - Otherwise we need to find the constructor, if the value is not already a constructor ([] or {}) 
    if (spec) fieldType = spec.constructor == String ? spec : TypeCaster.getType(spec);
    if (fieldType == Object && spec['$type'] !== undefined) fieldType = spec['$type'];

    if (fieldType && fieldType.constructor == String) { 
      // The fieldType was specified with a String value (not a string constructor)
      // Attempt to covert the field type to a constructor
      fieldType = Schema.types[fieldType];
    }

    const validators = spec && spec['$validate'] ? spec['$validate'] : {};
    const filters = spec && spec['$filter'] ? spec['$filter'] : {};
    const name = spec && spec['$name'] ? spec['$name'] : fieldName;

    var path = meta['path'];
    
    // notNull can be defaulted via global option
    validators['notNull'] = validators['notNull'] !== undefined ? validators['notNull'] : this.options['defaultNotNull'];
      
    var defaultValue = filters['defaultValue'];
    if (defaultValue === undefined) {
      if (fieldType == Object) {
        defaultValue = {};
      } else if (fieldType == Array) {
        defaultValue = [];
      } else if (fieldType == Schema.types.ObjectID) {
        defaultValue = function(){
          return new Schema.types.ObjectID;
        };
      }
    }
    
    if ((value === undefined || Schema.isNull(value)) && defaultValue !== undefined) {
      value = (typeof defaultValue == 'function') ? defaultValue() : defaultValue;
    }

    if (!Number.isInteger(fieldName) && !Schema.isValidFieldName(fieldName)) {
      Schema.appendError(meta, path, 'Invalid field name');
    }

    var validateResults = Validator.validate(value, validators, name, meta['root']);
    if (Array.isArray(validateResults)) {
      validateResults.forEach((result) => {
        Schema.appendError(meta, path, result);
      });
    }
    
    if (value != undefined) {
      // We only attempt to type cast if the type was specified, the value is not null and not undefined
      // - a type cast failure would result in an error which we do not want in the case of undefined or null
      // - these indicate no-value, and so there is nothing to cast
      if (fieldType && fieldType != Mixed) value = this.typeCast(fieldType, value, meta);
    }

    if (fieldType == Object) {
      // If in strict mode we must ensure there are no fields which are not defined by the spec
      if (this.options['strict']) {
        for (let fieldName in value) {
          var path = path + '.' + fieldName;
          if (spec[fieldName] == undefined) {
            Schema.appendError(meta, path, 'Field not specified');
          }
        }
      }
    }

    var result = {
      isValid: meta['isValid'],
      errors: meta['errors']
    };

    return value;
  }
  typeCast(requiredType, value, meta = {})
  {
    var result = value;
    var requiredTypeName = TypeCaster.getTypeName(requiredType);
    var valueTypeName = TypeCaster.getTypeName(value);

    // We compare type names rather than constructors 
    // - because sometimes we need to treat two different implentations as the same type
    // - An exmaple of this is ObjectID type. Mongo has its own implementation which should
    // - be considered the same type as ObjectID implementation used by Schema (bson-objectid)
    if (requiredTypeName != valueTypeName) {
      result = TypeCaster.cast(requiredType, value);

      let resultTypeName = TypeCaster.getTypeName(result);
      if (
        // We failed to convert to the specified type
        resultTypeName != requiredTypeName || 
        // We converted to type 'number' but the result was NaN so its invalid
        (valueTypeName != 'Number' && resultTypeName == 'Number' && isNaN(result)) 
      ) {
        let path = meta['path'];
        let origValue = (['String', 'Number', 'Boolean'].indexOf(valueTypeName) != -1) ? "'" + value + "'" : '';
        Schema.appendError(meta, path, origValue + ' of type ' + valueTypeName + ' cannot be cast to type ' + requiredTypeName);
      }
    }

    return result;
  }
  static appendError(meta, path, error)
  {
    var errors = Array.isArray(meta.errors[path]) ? meta.errors[path] : [];
    errors.push(error);
    meta.errors[path] = errors;
  }
  static isNull(value)
  {
    var result = value === null || (
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null'
    );
    
    return result;
  }
  static isValidFieldName(fieldName)
  {
    var valid = true;
    if (valid && fieldName.charAt(0) == '$') valid = false;
    return valid;
  }
  static mergeValidationResults(results)
  {
    results = Array.isArray(results) ? results : [];
    var finalResult = {errors: {}};
    results.forEach(function(result, x){
      if (result.errors) Object.assign(finalResult.errors, result.errors)
    });
    finalResult.isValid = (Object.keys(finalResult.errors).length == 0);
    return finalResult;
  }
}

Schema.queryOperators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$not', '$nor'];

Schema.types = {
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Date: Date,
  ObjectID: ObjectID,
  Mixed: Mixed
};

module.exports = Schema;
