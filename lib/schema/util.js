'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeCaster = require('../type-caster');

var SchemaUtil = function () {
  function SchemaUtil() {
    (0, _classCallCheck3.default)(this, SchemaUtil);
  }

  (0, _createClass3.default)(SchemaUtil, null, [{
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