import SchemaUtil from './util';
import { SchemaMapper, SchemaMapperMeta } from './mapper';
import Validator from './validator';
import Filter from './filter';
import SchemaTypes from './types';
import TypeCaster from './type-caster';
import ObjectPathAccessor from './object-path-accessor';
import SchemaConfig from './config';
import SchemaSpec from './spec';

export interface SchemaValidationMeta 
{
  errors?: any;
  isValid?: boolean;
}

export interface SchemaValidationResult 
{
  errors?: object;
  isValid?: boolean;
}

export interface SchemaPaths 
{
  [key: string]: any
}

export interface SchemaQuery
{
  $eq?: any;
  $lt?: any;
  $gt?: any;
  $in?: Array<any>;
  $nin?: Array<any>;
  $and?: SchemaQuery | Array<SchemaQuery>;
  $or?: SchemaQuery | Array<SchemaQuery>;
  [key: string]: SchemaQuery | Array<SchemaQuery> | any;
}

export class Schema
{
  config: SchemaConfig;
  name: string;
  spec: SchemaSpec;
  constructors: {[key: string]: any};
  schemas: {[key:string]: Schema};
  schemaMapper: SchemaMapper;
  
  constructor(spec?: SchemaSpec, options?: SchemaConfig)
  {
    this.config = (options == undefined) ? {} : options;
    this.config.name = this.config.name ? this.config.name : '';
    this.config.spec = spec ? spec : {};
    this.config.constructors = this.config.constructors ? this.config.constructors : {};
    this.config.schemas = this.config.schemas ? this.config.schemas : {};

    this.name = this.config.name ? this.config.name : (this.config.spec.$name ? this.config.spec.$name : this.constructor.name);
    this.spec = this.config.spec ? this.config.spec : {};

    this.constructors = {};
    if (this.config.constructors) this.addConstructors(this.config.constructors);

    this.schemas = {};
    if (this.config.schemas) this.addSchemas(this.config.schemas);

    this.schemaMapper = null;
  }
  
  init()
  {
    if (!this.schemaMapper) {
      this.schemaMapper = new SchemaMapper(this.spec, this.config);
      this.schemaMapper.addSchemas(this.schemas);
      this.schemaMapper.init();
    }
  }
  
  getName()
  {
    return this.name;
  }
  
  setName(name: string)
  {
    this.name = name;
  }
  
  getSpec(): SchemaSpec
  {
    this.init(); // we need the normalised spec so we must initialise the SchemaMapper
    return this.schemaMapper.getSpec();
  }
  
  setSpec(spec: SchemaSpec)
  {
    this.spec = spec;
  }
  
  addConstructor(value)
  {
    this.constructors[value.alias ? value.alias : value.name] = value;
  }
  
  getConstructor(constructorName)
  {
    return this.constructors[constructorName] ? this.constructors[constructorName] : null;
  }
  
  addConstructors(constructors)
  {
    if (constructors) {
      // could be an array of constructor functions or a object map 
      var constructorsArray = Array.isArray(constructors) ? constructors : Object.keys(constructors).map(name => constructors[name]);
      constructorsArray.forEach(construct => {
        if (typeof construct == 'function') this.addConstructor(construct);
      });
    }
  }
  
  addSchema(schema: Schema)
  {
    this.schemas[schema.getName()] = schema;
  }
  
  addSchemas(schemas: Array<Schema> | {[key:string]: Schema})
  {
    if (schemas) {
      // could be an array of schema objects functions or a object map
      var schemasArray = Array.isArray(schemas) ? schemas : Object.keys(schemas).map(name => schemas[name]);
      schemasArray.forEach((schema) => {
        if (schema instanceof Schema) this.addSchema(schema);
      });
    }
  }
  
  applyTransients(object: any)
  {
    this.init();
    return (object && this.constructors) ? this.schemaMapper.map(object, (opts) => {
      let { spec, fieldName, container, path, meta: mapperMeta } = opts;

      if (container) {
        let pathRef = spec ? spec.$pathRef : null;
        if (pathRef){
          container[fieldName] = ObjectPathAccessor.getPath(pathRef, mapperMeta.root);
        }

        let construct = spec ? spec.$construct : null;
        if (construct){
          let constructorFunction = null;
          if (typeof construct === 'string' && this.constructors[construct]) {
            constructorFunction = this.constructors[construct];
          } else if (typeof construct === 'function') {
            constructorFunction = construct;
          } else {
            // constructor not found
            throw new Error('Constructor not found for ' + path);
          }
          if (constructorFunction) {
            if (
              Array.isPrototypeOf(constructorFunction)
              && (
                !container[fieldName] 
                || Array.isArray(container[fieldName])
              )
            ) {
              container[fieldName] = container[fieldName] 
                ? new constructorFunction(...container[fieldName])
                : Object.create(constructorFunction.prototype);
            } else {
              container[fieldName] = Object.assign(
                Object.create(constructorFunction.prototype), 
                container[fieldName]
              );
            }
          }
        }
      }
    }) : object;
  }
  
  stripTransients(object: any, mapperType?: string):any
  {
    this.init();
    var mapperType = (mapperType == 'mapPaths') ? 'mapPaths' : 'map';
    var deleteRefs = [];
    var result = object ? this.schemaMapper[mapperType](object, (opts) => {
      var {spec, fieldName, container} = opts;
      if (spec && container) {
        if (
          spec.$pathRef !== undefined ||
          spec.$relation
        ) {
          deleteRefs.push({container, fieldName});
        }
      }
    }) : object;
    deleteRefs.forEach(ref => {
      if (ref.container && ref.container[ref.fieldName]) delete ref.container[ref.fieldName];
    });
    return result;
  }
  
  async validate(object: any, config?: SchemaConfig): Promise<SchemaValidationResult>
  {
    this.init();
    var meta: SchemaValidationMeta = {errors: {}};
    config = config ?  config : {};

    var promises = [];
    this.schemaMapper.map(object, (opts) => {
      promises.push(
        (
          async () => {
            let { spec, specParent, fieldName, container, path, meta: mapperMeta } = opts;
            try {
              let value = await this.validateField({
                spec,
                specParent,
                fieldName,
                value: container ? container[fieldName] : undefined,
                path,
                config,
                meta,
                mapperMeta
              });
              if (container) container[fieldName] = value;
            } catch (e) {
              throw new Error('Validate field failed at "' + path + '": ' + e.message);
            }
          }
        )()
      );
    }, {
      // If the spec is for related data we do not validate
      // - this data will be stripped before any insertion or updating to persistance
      skipTransients: true
    });

    await Promise.all(promises);

    meta.isValid = (Object.keys(meta.errors).length == 0);
    
    return meta;
  }
  
  async validatePaths(paths: SchemaPaths | Array<SchemaPaths>, config?: SchemaConfig, meta?: SchemaValidationMeta): Promise<SchemaValidationResult>
  {
    this.init();
    var meta = meta ? meta : {errors: {}};
    var objects = Array.isArray(paths) ? paths : [paths];
    config = config ?  config : {};

    var promises = [];
    this.schemaMapper.mapPaths(objects, (opts) => {
      promises.push(
        (
          async () => {
            let { spec, specParent, fieldName, container, path, meta: mapperMeta } = opts;
            try {
              mapperMeta.root = container;
              let value = await this.validateField({
                spec,
                specParent,
                fieldName,
                value: container ? container[fieldName] : undefined,
                path,
                config,
                meta,
                mapperMeta
              });
              if (container) container[fieldName] = value;
            } catch (e) {
              throw new Error('Validate field failed at "' + path + '": ' + e.message);
            }
          }
        )()
      );
    }, {
      // If the spec is for related data we do not validate
      // - this data will be stripped before any insertion or updating to persistance
      skipTransients: true
    });

    await Promise.all(promises);
  
    meta.isValid = (Object.keys(meta.errors).length == 0);

    return meta;
  }
  
  async validateQuery(query: any, config?: SchemaConfig): Promise<SchemaValidationResult>
  {
    this.init();
    var meta = meta ? meta : {errors: {}};
    config = config ?  config : {};
    // This is a query - we are expecting fields which are not defined
    // - We dont want those to trigger an error so disabled strict validation
    config.strict = false;

    var promises = [];
    this.schemaMapper.mapQueryPaths(query, (path, queryPathFieldName, queryPathContainer) => {
      var paths = {};
      paths[path] = queryPathContainer[queryPathFieldName];
      this.schemaMapper.mapPaths(paths, (opts) => {
        promises.push(
          (
            async () => {
              let { spec, specParent, fieldName, container, path } = opts;
              let value = await this.validateField({
                spec,
                specParent,
                fieldName,
                value: container ? container[fieldName] : undefined,
                path,
                config,
                meta
              });
              if (queryPathContainer) queryPathContainer[queryPathFieldName] = value;
            }
          )()
        );
      }, {skipTransients: true});
    }, {skipTransients: true});

    await Promise.all(promises);
    
    meta.isValid = (Object.keys(meta.errors).length == 0);

    return meta;
  }
  
  filterPrivate(object: any, mode?: boolean | string, mapperType?: string)
  {
    this.init();
    mode = mode ? mode : true;
    var deleteRefs = [];
    var valueReplaceRefs = [];
    var mapperType = (mapperType == 'mapPaths') ? 'mapPaths' : 'map';
    var result = object ? this.schemaMapper[mapperType](object, (opts) => {
      let { spec, fieldName, container } = opts;
      const filters = spec && spec.$filter ? spec.$filter : {};
      if (filters.private === true || filters.private == mode){
        // We cant simply delete here because if we delete a parent of a structure we are already
        // - iterating we will get errors. Instead make a list of references to delete.
        // Once we have all the references we can safely delete them.
        if (container) deleteRefs.push({container, fieldName});
      }
      if (filters.privateValue === true || filters.privateValue == mode) {
        // The privateValue replaces any non null values as true and otherwise false
        // - this allows the removal of the private value while still indicating if a value exists or not
        if (container) valueReplaceRefs.push({container, fieldName});
      }
    }) : object;

    valueReplaceRefs.forEach(ref => {
      if (ref.container && ref.container[ref.fieldName]) {
        ref.container[ref.fieldName] = ref.container[ref.fieldName] == undefined ? ref.container[ref.fieldName] : true;
      }
    });
    deleteRefs.forEach(ref => {
      if (ref.container && ref.container[ref.fieldName]) delete ref.container[ref.fieldName];
    });
    return result;
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
          if (spec.$type !== undefined) {
            // The type specified in a spec object may be a constructor or a string also so this is recursive
            fieldType = this.specToFieldType(spec.$type, value);
          }
        }
      }
    }

    if (fieldType && fieldType.constructor == String) {
      // The fieldType was specified with a String value (not a string constructor)
      // Attempt to covert the field type to a constructor
      fieldType = SchemaTypes[fieldType];
    }

    return fieldType;
  }
  
  async validateField(
    opts: {
      spec: SchemaSpec, 
      specParent: SchemaSpec, 
      fieldName: string | number, 
      value: any, 
      path: string | number, 
      config?: SchemaConfig, 
      meta?: SchemaValidationMeta,
      mapperMeta?: SchemaMapperMeta
    }
  )
  {
    var { spec, specParent, fieldName, value, path, config, meta, mapperMeta } = opts;

    path = path ? path : fieldName;
    config = config ? config : {};
    meta = meta ? meta : {};
    mapperMeta = mapperMeta ? mapperMeta : {};

    const validators = spec && spec.$validate ? spec.$validate : {};
    const nullable = spec && spec.$nullable ? spec.$nullable : false;
    const filters = spec && spec.$filter ? spec.$filter : {};
    const label = spec && spec.$label ? spec.$label : fieldName;
    const strict = spec && spec.$strict !== undefined ? spec.$strict : (
      specParent && specParent.$strict !== undefined ? specParent.$strict : undefined
    );

    if (!SchemaUtil.isValidFieldName(fieldName)) {
      Schema.appendError(meta, path, 'Invalid field name');
    }

    const fieldType = this.specToFieldType(spec, value);

    // Configure default value filter if not already set
    let defaultValue = filters.defaultValue;
    if (fieldType == Object) {
      // The $nullable flag indicates that an object can have a null value
      // All other non array values can be null regardless 
      // - unless specifically configured as notNull via $validate config
      defaultValue = nullable ? null : {};
    } else if (fieldType == Array) {
      defaultValue = [];
    } else if (fieldName == '_id' && fieldType == SchemaTypes.ObjectID) {
      defaultValue = function() {
        return new SchemaTypes.ObjectID;
      };
    }

    // Default value must be applied before type-casting - because the default value may need to be type-casted
    // - for example converting default value 'now' to type Date
    if (defaultValue !== undefined) {
      value = await Filter.filter(value, {defaultValue});
    }

    if (value != undefined) {
      // We only attempt to type cast if the type was specified, the value is not null and not undefined
      // - a type cast failure would result in an error which we do not want in the case of undefined or null
      // - these indicate no-value, and so there is nothing to cast
      if (fieldType && fieldType != SchemaTypes.Mixed) value = this.typeCast(fieldType, value, path, meta);
    }

    if (fieldType == Object && strict) {
      // In strict mode we must ensure there are no fields which are not defined by the spec
      for (let fieldName in value) {
        if (spec[fieldName] == undefined) {
          Schema.appendError(meta, path + '.' + fieldName, 'Field not specified');
        }
      }
    }

    // Apply filters
    value = await Filter.filter(value, filters);

    // notNull can be defaulted via global option
    validators.notNull = validators.notNull !== undefined ? validators.notNull : this.config.defaultNotNull;

    var validateResults = await Validator.validate(value, validators, {label, root: mapperMeta.root});
    if (Array.isArray(validateResults)) {
      validateResults.forEach(result => {
        Schema.appendError(meta, path, result);
      });
    }

    return value;
  }
  
  typeCast(requiredType: any, value, path?, meta: SchemaValidationMeta = {})
  {
    // If the spec specifies the value should be an object and the value is already an object, we do not need to typecast
    // When we specify a type as Object we only care that it is an Object we dont care about its
    // specific constuctor type, we dont care if it is MyObject or YourObject
    var skip = (
      requiredType === Object && Array.isArray(value) == false && Object(value) === value 
      || requiredType === Array && value instanceof Array
    );
    var result = value;

    if (!skip) {
      var result = value;
      var requiredTypeName = TypeCaster.getTypeName(requiredType);
      var valueTypeName = TypeCaster.getTypeName(value);

      // We compare type names rather than constructors
      // - because sometimes we need to treat two different implementations as the same type
      // - An exmaple of this is the ObjectID type. MongoDB has its own implementation which should
      // - be considered the same type as ObjectID implementation used by Schema (bson-objectid)
      if (requiredTypeName != valueTypeName) {
        result = TypeCaster.cast(requiredType, value);

        let resultTypeName = TypeCaster.getTypeName(result);
        if (
          // We failed to convert to the specified type
          resultTypeName != requiredTypeName ||
          // We converted to type 'number' but the result was NaN so it is invalid
          (valueTypeName != 'Number' && resultTypeName == 'Number' && isNaN(result))
        ) {
          let origValue = (['String', 'Number', 'Boolean'].indexOf(valueTypeName) != -1) ? "'" + value + "'" : '';
          Schema.appendError(meta, path, origValue + ' of type ' + valueTypeName + ' cannot be cast to type ' + requiredTypeName);
        }
      }
    }

    return result;
  }
  
  static appendError(meta: SchemaValidationMeta, path, error)
  {
    var errors = Array.isArray(meta.errors[path]) ? meta.errors[path] : [];
    errors.push(error);
    meta.errors[path] = errors;
  }
  
  static isNull(value: any)
  {
    var result = value === null || (
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null'
    );

    return result;
  }
  
  static mergeValidationResults(results: Array<SchemaValidationResult>): SchemaValidationResult
  {
    results = Array.isArray(results) ? results : [];
    var finalResult = {errors: {}} as SchemaValidationResult;
    results.forEach(result => {
      if (result.errors) Object.assign(finalResult.errors, result.errors)
    });
    finalResult.isValid = (Object.keys(finalResult.errors).length == 0);
    return finalResult;
  }
}

export default Schema;
