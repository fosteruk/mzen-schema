import ObjectID from 'bson-objectid';

export class SchemaTypeCaster
{
  static type: {[key: string]: any};
  
  /**
   * Get Type
   *
   * If value is a function that will be returned otherwise the values constructor will be returned.
   */
  static getType(value: any)
  {
    return typeof value == 'function' ? value : ((value === null || value === undefined) ? value : (value).constructor);
  }

  static getTypeName(value: any)
  {
    const { alias, name } = SchemaTypeCaster.getType(value);
    return alias ? alias : name;
  }

  static cast(toType: any, value: any)
  {
    const fromTypeName = SchemaTypeCaster.getTypeName(value);
    const fromSchemaTypeCaster = SchemaTypeCaster.type[fromTypeName];
    if (fromSchemaTypeCaster == undefined) throw new Error('Can not cast from unknown type "' + fromTypeName + '"');

    const toTypeName = SchemaTypeCaster.getTypeName(toType);
    const toSchemaTypeCaster = SchemaTypeCaster.type[toTypeName];
    if (toSchemaTypeCaster == undefined) throw new Error('Can not cast to unknown type "' + toTypeName + '"');

    var result = value;
    // If there is a cast function for toType then we cast the value
    // - otherwise the case is not supported so we simply return the original value
    const castFunctionName = SchemaTypeCaster.getCastFunctionName(fromTypeName);
    if (typeof toSchemaTypeCaster[castFunctionName] == 'function') {
      result = toSchemaTypeCaster[castFunctionName](value);
    }

    return result;
  }

  static getCastFunctionName(typeName: string)
  {
    return 'cast' + typeName.charAt(0).toUpperCase() + typeName.slice(1);
  }
}

class SchemaTypeCasterString
{
  static castNumber(value: number): string
  {
    return (value).toString();
  }

  static castBoolean(value: boolean): string
  {
    return (value) ? '1' : '0';
  }

  static castObjectID(value: ObjectID): string
  {
    return value.toString();
  }
}

class SchemaTypeCasterNumber
{
  static castString(value: string): number
  {
    return (+value);
  }

  static castBoolean(value: boolean): number
  {
    return (value) ? 1 : 0;
  }
}

class SchemaTypeCasterBoolean
{
  static castString(value: string): boolean
  {
    value = value.trim().toLowerCase();
    return (value == '1' || value == 'true');
  }

  static castNumber(value: number): boolean
  {
    return (value > 0);
  }
}

class SchemaTypeCasterDate
{
  static castString(value: string): Date
  {
    var result = undefined;
    if (value == '' || value.toLowerCase() == 'now') {
      result = new Date();
    } else {
      result = new Date(value);
    }
    return result;
  }

  static castNumber(value: number): Date
  {
    return new Date(value);
  }
}

class SchemaTypeCasterObjectID 
{
  static castString(value: string): ObjectID
  {
    // The string 'new' can be used request a new object id
    value = value == 'new' ? undefined :  value;
    return new ObjectID(value);
  }
}

SchemaTypeCaster.type = {
  String: SchemaTypeCasterString,
  Number: SchemaTypeCasterNumber,
  Boolean: SchemaTypeCasterBoolean,
  Object: {}, // Object is a valid type but we can not cast a primitive to an object so it has no cast methods
  Array: {}, // Array is a valid type but we can not cast a primitive to an object so it has no cast methods
  Date: SchemaTypeCasterDate,
  ObjectID: SchemaTypeCasterObjectID // This is a mongodb specific type
};

export default SchemaTypeCaster;
