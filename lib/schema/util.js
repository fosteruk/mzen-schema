'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypeCaster = require('../type-caster');

var SchemaUtil = function () {
  function SchemaUtil() {
    _classCallCheck(this, SchemaUtil);
  }

  _createClass(SchemaUtil, null, [{
    key: 'getSpec',
    value: function getSpec(path, spec) {
      var spec = spec ? spec : {};
      var pathParts = path && path ? path.split('.') : [];

      var currentPathPart = pathParts.shift();
      if (currentPathPart) {
        if (spec[currentPathPart]) {
          spec = spec[currentPathPart];
        } else {
          var partAsNumber = TypeCaster.cast(Number, currentPathPart);
          var partIsNumber = TypeCaster.getType(partAsNumber) == Number && !isNaN(partAsNumber);
          if (currentPathPart != '*' && partIsNumber == false) {
            // There is no spec defined for the given path
            // - and the path is not an array so there is no matching field config
            return undefined;
          }
        }
      }

      if (pathParts.length) {
        var type = TypeCaster.getType(spec);
        if (type == Array && spec.length) {
          spec = spec[0];
        } else if (type == Object && spec['$spec']) {
          spec = spec['$spec'];
        }
        spec = SchemaUtil.getSpec(pathParts.join('.'), spec);
      }

      return spec;
    }
  }, {
    key: 'isValidFieldName',
    value: function isValidFieldName(fieldName) {
      return Number.isInteger(fieldName) || !SchemaUtil.isQueryOperator(fieldName);
    }
  }, {
    key: 'isQueryOperator',
    value: function isQueryOperator(fieldName) {
      return typeof fieldName == 'string' && fieldName.charAt(0) == '$';
    }
    // When validating a query its assumed that all fields-names of the query object, other than operators, are data object paths
    // - operators are skipped and their values are passed to the validator for validation
    // - this is simple solution that allows validation of schema paths within simple query operators ($and / $or)
    // - Some operators cannot be validated in this way because the operator values are not schema paths
    // - One exmaple of this is the $near operator whos value is a specific structure unrelated to the schema 
    // - As a temporary solution we simply dont attempt to validate operator values which dont fit the basic pattern ($and / $or)
    // Whats needed is a more intelligent query validator that is aware of how to handle each operator value

  }, {
    key: 'canValidateQueryOperator',
    value: function canValidateQueryOperator(fieldName) {
      var cantValidateOperators = ['$near'];
      return cantValidateOperators.indexOf(fieldName) == -1;
    }
  }]);

  return SchemaUtil;
}();

module.exports = SchemaUtil;