'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeCaster = require('../type-caster');
var Schema = require('../schema');

var Filter = function () {
  function Filter() {
    (0, _classCallCheck3.default)(this, Filter);
  }

  (0, _createClass3.default)(Filter, null, [{
    key: 'filter',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(value, filtersConfig) {
        var configKeys, x, filterName, _filter, filterConfig, y;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                configKeys = Object.keys(filtersConfig);
                x = 0;

              case 2:
                if (!(x < configKeys.length)) {
                  _context.next = 22;
                  break;
                }

                filterName = configKeys[x];
                _filter = Filter[filterName];

                if (!(filterName == 'private')) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt('continue', 19);

              case 7:
                if (!(typeof _filter != 'function')) {
                  _context.next = 9;
                  break;
                }

                throw new Error('Uknown filter "' + filterName + '"');

              case 9:
                filterConfig = filtersConfig[filterName];
                // If filtersConfig is an array we run the validator multiple times 
                // - one for each filtersConfig object

                filterConfig = Array.isArray(filterConfig) ? filterConfig : [filterConfig];

                y = 0;

              case 12:
                if (!(y < filterConfig.length)) {
                  _context.next = 19;
                  break;
                }

                _context.next = 15;
                return Promise.resolve(_filter(value, filterConfig[y]));

              case 15:
                value = _context.sent;

              case 16:
                y++;
                _context.next = 12;
                break;

              case 19:
                x++;
                _context.next = 2;
                break;

              case 22:
                return _context.abrupt('return', value);

              case 23:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function filter(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return filter;
    }()
  }, {
    key: 'isNull',
    value: function isNull(value) {
      var result = value === null ||
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null';

      return result;
    }
  }, {
    key: 'defaultValue',
    value: function defaultValue(value, options) {
      if (value === undefined || Filter.isNull(value)) {
        var defaultValue = options;
        value = typeof defaultValue == 'function' ? defaultValue() : defaultValue;
      }
      return value;
    }

    // Filter function
    // - returns an error message string or an array of error messages on failure otherwise returns boolean true

  }, {
    key: 'trim',
    value: function trim(value, options) {
      if (typeof value == 'string') value = value.trim();
      return value;
    }
  }, {
    key: 'uppercase',
    value: function uppercase(value, options) {
      if (typeof value == 'string') value = value.toUpperCase();
      return value;
    }
  }, {
    key: 'lowercase',
    value: function lowercase(value, options) {
      if (typeof value == 'string') value = value.toLowerCase();
      return value;
    }
  }, {
    key: 'custom',
    value: function custom(value, options) {
      var filter = options;
      if (typeof filter == 'function') value = filter(value);
      return value;
    }
  }]);
  return Filter;
}();

module.exports = Filter;