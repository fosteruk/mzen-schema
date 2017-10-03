'use strict'
var clone = require('clone');
var ObjectID = require('bson-objectid');
var SchemaUtil = require('./util');
var Types = require('./types');
var TypeCaster = require('../type-caster');

class SchemaMapper
{
  constructor(spec, options) 
  {
    this.spec = (spec == undefined) ? {} : spec;
    this.options = (options == undefined) ? {} : options;
  }
  map(data, callback)
  {
    const meta = {path: '', errors: {}};
    // Clone the spec as it may be temporarily modified in the process of validation
    // If the data is an array we must present the spec as an array also
    var spec = Array.isArray(data) ? [clone(this.spec)] : clone(this.spec);

    // We have to pass the data in as a object field as that is the only way to reference data
    var root = {root: data};
    
    this.mapField(spec, 'root', root, meta, callback);
  }
  mapPaths(paths, callback, meta)
  {
    var meta = meta ? meta : {path: '', errors: {}};
    var objects = Array.isArray(paths) ? paths : [paths];

    meta['path'] = this.initPath(meta['path']);
    objects.forEach(function(object){
      for (let fieldPath in object) {
        meta['path'] = fieldPath;
        var spec = SchemaUtil.getSpec(fieldPath, this.spec);
        this.mapField(spec, fieldPath, object, meta, callback);
      }
    }.bind(this));
  }
  mapQueryPaths(query, callback)
  {
    // When validating a query its assumed that all fields-names of the query object, other than operators, are data object paths
    // - operators are skipped and their values are passed to the validator for validation - ( {$and: [{path: value}, {path: value}] )
    // - this is simple solution that allows validation of schema paths within simple query operators ($and / $or)
    // - Some operators cannot be validated in this way because the operator values are not schema paths
    // - One example of this is the $near operator whos value is a specific structure unrelated to the schema 
    // - As a temporary solution we simply dont attempt to validate operator values which dont fit the basic pattern ($and / $or)
    // - See SchemaUtil.canValidateQueryOperator()
    // Whats needed is a more intelligent query validator that is aware of how to handle each operator value

    const mapRecursive = (query) => {
      if (TypeCaster.getType(query) == Object) {
        for (let fieldName in query) {
          if (!query.hasOwnProperty(fieldName)) continue;
          if (SchemaUtil.isQueryOperator(fieldName)) {
            if (SchemaUtil.canValidateQueryOperator(childFieldName)) {
              // If this element is an operator - we want to validate is values
              if (['$or', '$and'].indexOf(fieldName) != -1) {
                query[fieldName].forEach(function(value, x){
                  mapRecursive(query[fieldName][x]);
                });
              } else {
                mapRecursive(query[fieldName]);
              }
            }
          } else {
            // This field name is not an operator
            // Check if the value contains an operator field
            // - if it does we should callack back with its values: {field: {$eq: value}}
            // - otherwise we should callback with the field itself {field: value}
            var hasOpertators = false;
            if (TypeCaster.getType(query[fieldName]) == Object) {
              for (var childFieldName in query[fieldName]) {
                hasOpertators = hasOpertators || SchemaUtil.isQueryOperator(childFieldName);
                if (hasOpertators && SchemaUtil.canValidateQueryOperator(childFieldName)) {
                  if (Array.isArray(query[fieldName][childFieldName])) {
                    query[fieldName][childFieldName].forEach(function(value, x){
                      callback(fieldName, x, query[fieldName][childFieldName]);
                    });
                  } else {
                    callback(fieldName, childFieldName, query[fieldName]);
                  }
                }
              }
            }
            if (!hasOpertators) {
              if (Array.isArray(query[fieldName])) {
                query[fieldName].forEach(function(value, x){
                  callback(fieldName, x, query[fieldName]);
                });
              } else {
                callback(fieldName, fieldName, query);
              }
            }
          }
        }
      } else if (Array.isArray(query)) {
        query.forEach(function(arrayValue, x){
          mapRecursive(query[x], meta);
        });
      } 
      return query;
    };
    
    mapRecursive(query);
  }
  mapRecursive(spec, object, meta = {}, callback)
  {
    meta['path'] = this.initPath(meta['path']);
  
    var specTemp = clone(spec);
    // If match all spec is defined, newSpec defaults to an empty object since any spec rules should be replaced by 
    // - the match-all spec (defaults to original spec)
    const matchAllSpec = (spec && spec['*'] != undefined) ? spec['*'] : undefined;
    const newSpec = (matchAllSpec != undefined) ? {} :  specTemp;
    for (var fieldName in object) {
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
    specTemp = newSpec;

    var basePath = meta['path'];

    for (var fieldName in specTemp) {
      if (SchemaUtil.isQueryOperator(fieldName)) continue; // Descriptor proptery
      meta['path'] = basePath.length ? basePath + '.' + fieldName : fieldName;
      this.mapField(specTemp[fieldName], fieldName, object, meta, callback);
    }
  }
  mapArrayElements(spec, array, meta = {}, callback)
  {
    meta['path'] = this.initPath(meta['path']);

    var basePath = meta['path'];

    array.forEach(function(element, x){
      meta['path'] = basePath.length ? basePath + '.' + x :  '' + x;
      this.mapField(spec, x, array, meta, callback);
    }, this);
  }
  mapField(spec, fieldName, container, meta = {}, callback)
  {
    meta['path'] = this.initPath(meta['path']);
    
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
  initPath(path)
  {
    return path !== undefined && path.length ? path : '';
  }
}

module.exports = SchemaMapper;