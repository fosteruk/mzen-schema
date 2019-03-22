import ObjectID from 'bson-objectid';

export class SchemaTypeCaster
{
  static type: {[key: string]: any};
  
  /**
   * Get Type
   *
   * If value is a function that will be returned otherwise the values constructor will be returned.
   */
  static getType(value)
  {
    return typeof value == 'function' ? value : ((value === null || value === undefined) ? value : (value).constructor);
  }

  static getTypeName(value)
  {
    return SchemaTypeCaster.getType(value).name;
  }

  static cast(toType, value)
  {
    const fromTypeName = SchemaTypeCaster.getTypeName(value);
    const fromSchemaTypeCaster = SchemaTypeCaster.type[fromTypeName];
    if (fromSchemaTypeCaster == undefined) throw new Error('Can not cast from unknown type "' + fromTypeName + '"');

    const toTypeName = SchemaTypeCaster.getTypeName(toType);
    const toSchemaTypeCaster = SchemaTypeCaster.type[SchemaTypeCaster.getTypeName(toType)];
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

  static getCastFunctionName(typeName)
  {
    return 'cast' + typeName.charAt(0).toUpperCase() + typeName.slice(1);
  }
}

class SchemaTypeCasterString
{
  static castNumber(value)
  {
    return (value).toString();
  }

  static castBoolean(value)
  {
    return (value) ? '1' : '0';
  }

  static castObjectID(value)
  {
    return value.toString();
  }
}

class SchemaTypeCasterNumber
{
  static castString(value)
  {
    return (+value);
  }

  static castBoolean(value)
  {
    return (value) ? 1 : 0;
  }
}

class SchemaTypeCasterBoolean
{
  static castString(value)
  {
    value = value.trim().toLowerCase();
    return (value == '1' || value == 'true');
  }

  static castNumber(value)
  {
    return (value > 0);
  }
}

class SchemaTypeCasterDate
{
  static castString(value)
  {
    var result = undefined;
    if (value == '' || value.toLowerCase() == 'now') {
      result = new Date();
    } else {
      result = new Date(value);
    }
    return result;
  }

  static castNumber(value)
  {
    return new Date(value);
  }
}

class SchemaTypeCasterObjectID
{
  static castString(value)
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
  ObjectID: SchemaTypeCasterObjectID, // This is a mongodb specific type
};

export default SchemaTypeCaster;
