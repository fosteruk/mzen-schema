"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_caster_1 = require("../type-caster");
class SchemaUtil {
    static getSpec(path, spec) {
        var spec = spec ? spec : {};
        var pathParts = path && path ? path.split('.') : [];
        var currentPathPart = pathParts.shift();
        if (currentPathPart) {
            if (spec[currentPathPart]) {
                spec = spec[currentPathPart];
            }
            else {
                const partAsNumber = type_caster_1.default.cast(Number, currentPathPart);
                const partIsNumber = type_caster_1.default.getType(partAsNumber) == Number && !isNaN(partAsNumber);
                if (currentPathPart != '*' && partIsNumber == false) {
                    // There is no spec defined for the given path
                    // - and the path is not an array so there is no matching field config
                    return undefined;
                }
            }
        }
        if (pathParts.length) {
            const type = type_caster_1.default.getType(spec);
            if (type == Array && spec.length) {
                spec = spec[0];
            }
            else if (type == Object && spec['$spec']) {
                spec = spec['$spec'];
            }
            spec = SchemaUtil.getSpec(pathParts.join('.'), spec);
        }
        return spec;
    }
    static isValidFieldName(fieldName) {
        return (Number.isInteger(fieldName) || !SchemaUtil.isQueryOperator(fieldName));
    }
    static isQueryOperator(fieldName) {
        return (typeof fieldName == 'string' && fieldName.charAt(0) == '$');
    }
    static canValidateQueryOperator(fieldName) {
        var cantValidateOperators = ['$near'];
        return (cantValidateOperators.indexOf(fieldName) == -1);
    }
}
exports.default = SchemaUtil;
