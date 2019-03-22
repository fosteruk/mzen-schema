import clone = require('clone');
import SchemaUtil from './util';
import Types from './types';
import TypeCaster from './type-caster';
import Schema from './schema';
import SchemaConfig from './config';
import SchemaSpec from './spec';

interface SchemaMapperCallback 
{
  (spec: SchemaSpec, fieldName: string | number, container: object, metaPath: string, meta: object): void
}

export interface SchemaMapperMappingConfig 
{
  skipTransients?: boolean;
}

export interface SchemaMapperMeta 
{
  root?: object;
  errors?: object;
  isValid?: boolean
  path?: string
}

export class SchemaMapper
{
  config: SchemaConfig;
  spec: SchemaSpec;
  specNormalised: SchemaSpec;
  schemas: {[key: string]: Schema};
  
  constructor(spec: SchemaSpec, options?: SchemaConfig)
  {
    this.config = (options == undefined) ? {} : options;
    this.config.spec = spec ? spec : {};
    this.config.schemas = this.config.schemas ? this.config.schemas : {};

    this.schemas = {};
    if (this.config.schemas) {
      this.addSchemas(this.config.schemas);
    }

    this.spec = this.config.spec ? this.config.spec : {};
    this.specNormalised = null;
  }
  
  init()
  {
    if (!this.specNormalised) {
      this.specNormalised = this.normalizeSpec(clone(this.spec));
    }
  }
  
  getSpec()
  {
    this.init();
    return this.specNormalised;
  }
  
  addSchema(schema: Schema)
  {
    if (schema.getName) {
      this.schemas[schema.getName()] = schema;
    } else {
      throw new Error('Invalid schema')
    }
  }
  
  addSchemas(schemas: {[key: string]: Schema} | Array<Schema>)
  {
    if (schemas) {
      // could be an array of schema objects functions or a object map
      var schemasArray = Array.isArray(schemas) ? schemas : Object.keys(schemas).map(name => schemas[name]);
      schemasArray.forEach((schema) => {
        if (schema instanceof Schema) this.addSchema(schema);
      });
    }
  }
  
  normalizeSpec(spec)
  {
    // Resolve any embedded schema references
    if (Array.isArray(spec)) {
      spec.forEach((value, index) => {
        spec[index] = this.normalizeSpec(value);
      });
    } else if (spec && typeof spec == 'object') {
      if (spec.$schema) {
        let name = spec.$schema;
        // inject referenced schema spec
        if (!this.schemas[name]) {
          throw new Error('Missing schema reference ' + spec.$schema);
        } else {
          spec = Object.assign(clone(this.schemas[name].getSpec()), spec);
        }
        delete spec.$schema;
      } else {
        // this spec does not contain a schema ref - recurse
        Object.keys(spec).forEach((key) => {
          spec[key] = this.normalizeSpec(spec[key]);
        });
      }
    }

    return spec;
  }
  
  map(data: Array<object>|any, callback: SchemaMapperCallback, options?: SchemaMapperMappingConfig)
  {
    this.init();
    const meta = {path: '', errors: {}, root: data} as SchemaMapperMeta;
    // Clone the spec as it may be temporarily modified in the process of validation
    // If the data is an array we must present the spec as an array also
    var spec = Array.isArray(data) ? [clone(this.specNormalised)] : clone(this.specNormalised);

    if (SchemaMapper.specIsTransient(spec) && options && options.skipTransients) return;

    // We have to pass the data in as a object property as that is the only way to reference data
    return this.mapField(spec, 'root', {root: data}, callback, options, meta);
  }
  
  mapPaths(paths: any, callback: SchemaMapperCallback, options?: object, meta?: SchemaMapperMeta)
  {
    this.init();
    var meta = meta ? meta : {path: '', errors: {}} as SchemaMapperMeta;
    var objects = Array.isArray(paths) ? paths : [paths];

    meta.path = this.initPath(meta.path);
    objects.forEach((object) => {
      for (var fieldPath in object) {
        meta.path = fieldPath;
        var spec = SchemaUtil.getSpec(fieldPath, this.specNormalised);
        this.mapField(spec, fieldPath, object, callback, options, meta);
      }
    });
  }
  
  // @ts-ignore - unused options
  mapQueryPaths(query, callback, options = {})
  {
    // When validating a query its assumed that all fields-names of the query object, other than operators, are data object paths
    // - operators are skipped and their values are passed to the validator for validation - ( {$and: [{path: value}, {path: value}] )
    // - this is simple solution that allows validation of schema paths within simple query operators ($and / $or)
    // - Some operators cannot be validated in this way because the operator values are not schema paths
    // - One example of this is the $near operator whos value is a specific structure unrelated to the schema
    // - As a temporary solution we simply dont attempt to validate operator values which dont fit the basic pattern ($and / $or)
    // - See SchemaUtil.canValidateQueryOperator()
    // Whats needed is a more intelligent query validator that is aware of how to handle each operator value

    const mapRecursiveQuery = (query) => {
      if (TypeCaster.getType(query) == Object) {
        for (let fieldName in query) {
          if (!query.hasOwnProperty(fieldName)) continue;
          if (SchemaUtil.isQueryOperator(fieldName)) {
            if (SchemaUtil.canValidateQueryOperator(fieldName)) {
              // If this element is an operator - we want to validate is values
              if (['$or', '$and'].indexOf(fieldName) != -1) {
                query[fieldName].forEach(function(value){
                  mapRecursiveQuery(value);
                });
              } else {
                mapRecursiveQuery(query[fieldName]);
              }
            }
          } else {
            // This field name is not an operator
            // Check if the value contains an operator field
            // - if it does we should callack back with its values: {field: {$eq: value}}
            // - otherwise we should callback with the field itself {field: value}
            var hasOpertators = false;
            if (TypeCaster.getType(query[fieldName]) == Object) {
              for (let childFieldName in query[fieldName]) {
                hasOpertators = hasOpertators || SchemaUtil.isQueryOperator(childFieldName);
                if (hasOpertators && SchemaUtil.canValidateQueryOperator(childFieldName)) {
                  if (Array.isArray(query[fieldName][childFieldName])) {
                    // @ts-ignore - unused value
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
                // @ts-ignore - unused value
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
        query.forEach(function(arrayValue){
          mapRecursiveQuery(arrayValue);
        });
      }
      return query;
    };

    mapRecursiveQuery(query);
  }
  
  mapRecursive(
    spec: SchemaSpec, 
    object: any, 
    callback: SchemaMapperCallback, 
    options?: SchemaMapperMappingConfig, 
    meta: SchemaMapperMeta = {}
  )
  {
    this.init();
    meta.path = this.initPath(meta.path);

    if (SchemaMapper.specIsTransient(spec) && options && options.skipTransients) return;

    var specTemp = clone(spec);
    // If match all spec is defined, newSpec defaults to an empty object since any spec rules should be replaced by
    // - the match-all spec (defaults to original spec)
    const matchAllSpec = (spec && spec['*'] != undefined) ? spec['*'] : undefined;
    const newSpec = (matchAllSpec !== undefined) ? {} :  specTemp;
    for (let fieldName in object) {
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

    var basePath = meta.path;

    for (var fieldName in specTemp) {
      if (SchemaUtil.isQueryOperator(fieldName)) continue; // Descriptor proptery
      meta.path = basePath.length ? basePath + '.' + fieldName : fieldName;
      this.mapField(specTemp[fieldName], fieldName, object, callback, options, meta);
    }
  }
  
  mapArrayElements(
    spec: SchemaSpec, 
    array: Array<any>, 
    callback: SchemaMapperCallback, 
    options?: SchemaMapperMappingConfig, 
    meta: SchemaMapperMeta = {}
  )
  {
    this.init();
    meta.path = this.initPath(meta.path);

    var basePath = meta.path;

    if (SchemaMapper.specIsTransient(spec) && options && options.skipTransients) return;

    // @ts-ignore - unused element
    array.forEach((element, x) => {
      meta.path = basePath.length ? basePath + '.' + x :  '' + x;
      this.mapField(spec, x, array, callback, options, meta);
    });
  }
  
  mapField(
    spec: SchemaSpec, 
    fieldName: string | number, 
    container: any, 
    callback: SchemaMapperCallback, 
    options: SchemaMapperMappingConfig, 
    meta: SchemaMapperMeta = {}
  )
  {
    this.init();
    meta.path = this.initPath(meta.path);

    if (SchemaMapper.specIsTransient(spec) && options && options.skipTransients) return;

    var fieldType = undefined;
    // If the field type is a string value then it should contain the string name of the required type (converted to a constructor later).
    // - Otherwise we need to find the constructor, if the value is not already a constructor ([] or {})
    if (spec) fieldType = spec.constructor == String ? spec : TypeCaster.getType(spec);
    if (fieldType == Object && spec.$type !== undefined) fieldType = spec.$type;
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
    if (container && container[fieldName] === undefined && defaultValue !== undefined) {
      container[fieldName] = defaultValue;
    }

    callback(spec, fieldName, container, meta.path, meta);
    switch (fieldType) {
      case Object:
        if (spec.$spec !== undefined) spec = spec.$spec;
        this.mapRecursive(
          spec,
          container ? container[fieldName] : undefined,
          callback,
          options,
          meta
        );
      break;
      case Array:
        var arraySpec = undefined;
        if (Array.isArray(spec) && spec[0]) {
          // If the field is an array the specification for the array elements shoud be contained in the first element
          arraySpec = spec[0];
        } else if (TypeCaster.getType(spec) == Object && spec.$spec) {
          // If the field type is an object which specifies type "Array"
          // - then the array elements spec should be specified using the "$spec" property
          arraySpec = spec.$spec;
        }
        if (container && arraySpec && container[fieldName]) {
          this.mapArrayElements(arraySpec, container[fieldName], callback, options, meta);
        }
      break;
    }

    return container ? container[fieldName] : undefined;
  }
  
  initPath(path)
  {
    return path !== undefined && path.length ? path : '';
  }
  
  static specIsTransient(spec)
  {
    return (spec && (spec.$relation != null || spec.$pathRef != null));
  }
}

export default SchemaMapper;