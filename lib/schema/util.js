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
  }]);

  return SchemaUtil;
}();

module.exports = SchemaUtil;