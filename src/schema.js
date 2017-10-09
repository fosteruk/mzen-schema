'use strict'
var clone = require('clone');
var ObjectID = require('bson-objectid');
var SchemaUtil = require('./schema/util');
var Mapper = require('./schema/mapper');
var Validator = require('./schema/validator');
var Filter = require('./schema/filter');
var Types = require('./schema/types');
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
  validate(object, options)
  {
    var meta = {errors: {}, root: object};
    var isArray = Array.isArray(object);
    options = options ?  options : {};

    var promises = [];
    this.mapper.map(object, (fieldSpec, fieldName, fieldContainer, path) => {
      let promise = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then((value) => {
        fieldContainer[fieldName] = value;
      });
      promises.push(promise);
    });

    var promise = Promise.all(promises).then(() => {
      meta.isValid = (Object.keys(meta.errors).length == 0);
      return meta;
    });

    return promise;
  }
  validatePaths(paths, options, meta)
  {
    var meta = meta ? meta : {errors: {}};
    var objects = Array.isArray(paths) ? paths : [paths];
    options = options ?  options : {};

    var promises = [];
    this.mapper.mapPaths(objects, (fieldSpec, fieldName, fieldContainer, path) => {
      meta['root'] = fieldContainer;
      let promise = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then((value) => {
        fieldContainer[fieldName] = value;
      });
      promises.push(promise);
    });
    
    var promise = Promise.all(promises).then(() => {
      meta.isValid = (Object.keys(meta.errors).length == 0);
      return meta;
    });

    return promise;
  }
  validateQuery(query, options)
  {
    var meta = meta ? meta : {errors: {}};
    options = options ?  options : {};
    // This is a query - we are expecting fields which are not defined
    // - We dont want those to trigger an error so disabled strict validation
    options['strict'] = false; 

    var promises = [];
    this.mapper.mapQueryPaths(query, (path, queryPathFieldName, container) => {
      var paths = {};
      paths[path] = container[queryPathFieldName];
      this.mapper.mapPaths(paths, (fieldSpec, fieldName, fieldContainer, path) => {
        let promise = this.validateField(fieldSpec, fieldName, fieldContainer[fieldName], path, options, meta).then((value) => {
          container[queryPathFieldName] = value;
        });
        promises.push(promise);
      });
    });

    var promise = Promise.all(promises).then(() => {
      meta.isValid = (Object.keys(meta.errors).length == 0);
      return meta;
    });

    return promise;
  }
  filterPrivate(object, mode)
  {
    mode = mode ? mode : true;
    var deleteRefs = [];
    this.mapper.map(object, (fieldSpec, fieldName, fieldContainer, path) => {
      const filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
      if (filters['private'] === true || filters['private'] == mode){
        // We cant simply delete here because if we delete a parent of a structure we are already
        // - iterating we will get errors. Instead make a list of references to delete.
        // Once we have all the references we can safely delete them.
        deleteRefs.push({fieldContainer, fieldName});
      }
    });

    deleteRefs.forEach((ref) => {
      if (ref.fieldContainer && ref.fieldContainer[ref.fieldName]) delete ref.fieldContainer[ref.fieldName];
    });
  }
  filterPrivatePaths(paths, mode)
  {
    mode = mode ? mode : true;
    var objects = Array.isArray(paths) ? paths : [paths];
    var deleteRefs = [];
    this.mapper.mapPaths(objects, (fieldSpec, fieldName, fieldContainer, path) => {
      const filters = fieldSpec && fieldSpec['$filter'] ? fieldSpec['$filter'] : {};
      if (filters['private'] === true || filters['private'] == mode){
        // We cant simply delete here because if we delete a parent of a structure we are already
        // - iterating we will get errors. Instead make a list of references to delete.
        // Once we have all the references we can safely delete them.
        deleteRefs.push({fieldContainer, fieldName});
      }
    });

    deleteRefs.forEach((ref) => {
      if (ref.fieldContainer && ref.fieldContainer[ref.fieldName]) delete ref.fieldContainer[ref.fieldName];
    });
  }
  specToFieldType(spec, value)
  {
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
  async validateField(spec, fieldName, value, path, options, meta = {})
  {
    path = path ? path : fieldName;
    const validators = spec && spec['$validate'] ? spec['$validate'] : {};
    const filters = spec && spec['$filter'] ? spec['$filter'] : {};
    const name = spec && spec['$name'] ? spec['$name'] : fieldName;
    options = options ? options : {};
    
    if (!SchemaUtil.isValidFieldName(fieldName)) {
      Schema.appendError(meta, path, 'Invalid field name');
    }

    var fieldType = this.specToFieldType(spec, value);

    // Configure default value filter if not already set
    var defaultValue = filters['defaultValue'];
    if (fieldType == Object) {
      defaultValue = {};
    } else if (fieldType == Array) {
      defaultValue = [];
    } else if (fieldType == Types.ObjectID) {
      defaultValue = function() {
        return new Types.ObjectID;
      };
    }
    // Default value must be applied before type-casting - because the default value may need to be type-casted 
    // - for exmaple converting default value 'now' to type Date
    if (defaultValue !== undefined) {
      value = await Filter.filter(value, {defaultValue});
    }

    if (value != undefined) {
      // We only attempt to type cast if the type was specified, the value is not null and not undefined
      // - a type cast failure would result in an error which we do not want in the case of undefined or null
      // - these indicate no-value, and so there is nothing to cast
      if (fieldType && fieldType != Types.Mixed) value = this.typeCast(fieldType, value, path, meta);
    }

    if (fieldType == Object) {
      let strict = (options['strict'] !== undefined) ? options['strict'] : this.options['strict'];
      // If in strict mode we must ensure there are no fields which are not defined by the spec
      if (strict) {
        for (let fieldName in value) {
          if (spec[fieldName] == undefined) {
            Schema.appendError(meta, path + '.' + fieldName, 'Field not specified');
          }
        }
      }
    }

    // Apply filters
    value = await Filter.filter(value, filters);

    // notNull can be defaulted via global option
    validators['notNull'] = validators['notNull'] !== undefined ? validators['notNull'] : this.options['defaultNotNull'];

    var validateResults = await Validator.validate(value, validators, {name, root: meta['root']});
    if (Array.isArray(validateResults)) {
      validateResults.forEach((result) => {
        Schema.appendError(meta, path, result);
      });
    }

    return value;
  }
  typeCast(requiredType, value, path, meta = {})
  {
    // If the spec specifies the value should be an object and the value is already an object, we do not need to typecast
    // It is impossible for us to cast an object to any object type other than Object
    // When we specify a type as Object we only care that it is an Object we dont care about its 
    // specific type, we dont care if it is MyObject or YourObject
    var skip = (requiredType === Object && Array.isArray(value) == false && Object(value) === value);
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

        let resultTypeName = TypeCaster.getTypeName(result);
        if (
          // We failed to convert to the specified type
          resultTypeName != requiredTypeName || 
          // We converted to type 'number' but the result was NaN so its invalid
          (valueTypeName != 'Number' && resultTypeName == 'Number' && isNaN(result)) 
        ) {
          let origValue = (['String', 'Number', 'Boolean'].indexOf(valueTypeName) != -1) ? "'" + value + "'" : '';
          Schema.appendError(meta, path, origValue + ' of type ' + valueTypeName + ' cannot be cast to type ' + requiredTypeName);
        }
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

module.exports = Schema;
