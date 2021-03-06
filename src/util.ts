import TypeCaster from './type-caster';
import SchemaSpec from './spec';

export class SchemaUtil
{
  static getSpec(path: string, spec: SchemaSpec)
  {
    var spec = spec ? spec : {} as SchemaSpec;
    var pathParts = path && path ? path.split('.') : [];

    var currentPathPart = pathParts.shift();
    if (currentPathPart) {
      if (spec[currentPathPart]) {
        spec = spec[currentPathPart];
      } else {
        const partAsNumber = TypeCaster.cast(Number, currentPathPart);
        const partIsNumber = TypeCaster.getType(partAsNumber) == Number && !isNaN(partAsNumber);
        if (currentPathPart != '*' && partIsNumber == false) {
          // There is no spec defined for the given path
          // - and the path is not an array so there is no matching field config
          return undefined;
        }
      }
    }

    if (pathParts.length) {
      const type =  TypeCaster.getType(spec);
      if (type == Array && spec.length) {
        spec = spec[0];
      } else if (type == Object && spec['$spec']) {
        spec = spec['$spec'];
      }
      spec = SchemaUtil.getSpec(pathParts.join('.'), spec);
    }

    return spec;
  }
  
  static isValidFieldName(fieldName)
  {
    return (Number.isInteger(fieldName) || !SchemaUtil.isOperator(fieldName));
  }
  
  static isOperator(fieldName)
  {
    return (typeof fieldName == 'string' && fieldName.charAt(0) == '$');
  }
  
  static canValidateQueryOperator(fieldName)
  {
    var cantValidateOperators = ['$near'];
    return (cantValidateOperators.indexOf(fieldName) == -1);
  }
}

export default SchemaUtil;
