'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypeCaster = require('../type-caster');

var Validator = function () {
  function Validator() {
    _classCallCheck(this, Validator);
  }

  _createClass(Validator, null, [{
    key: 'validate',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(value, validatorsConfig, options) {
        var results, name, root, configKeys, x, validatorName, validator, validatorConfig, y, config, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                results = true;
                name = options.name, root = options.root;
                configKeys = Object.keys(validatorsConfig);
                x = 0;

              case 4:
                if (!(x < configKeys.length)) {
                  _context.next = 27;
                  break;
                }

                validatorName = configKeys[x];
                validator = Validator[validatorName];

                if (!(typeof validator != 'function')) {
                  _context.next = 9;
                  break;
                }

                throw new Error('Uknown validator "' + validatorName + '"');

              case 9:
                if (!(validatorsConfig[validatorName] === false || validatorsConfig[validatorName] == undefined)) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt('continue', 24);

              case 11:
                // Falsey value disables the validator  

                validatorConfig = !validatorsConfig[validatorName] || typeof validatorsConfig[validatorName] == 'boolean' ? {} : validatorsConfig[validatorName];
                // If validatorConfig is an array we run the validator multiple times 
                // - one for each validatorConfig object

                validatorConfig = Array.isArray(validatorConfig) ? validatorConfig : [validatorConfig];

                y = 0;

              case 14:
                if (!(y < validatorConfig.length)) {
                  _context.next = 24;
                  break;
                }

                config = Object.assign({}, options, validatorConfig[y]);
                // We only validate if we dont already have an error 

                if (!(results === true)) {
                  _context.next = 21;
                  break;
                }

                _context.next = 19;
                return Promise.resolve(validator(value, config));

              case 19:
                result = _context.sent;

                if (result !== true) {
                  // validator function can return either true, a single message string or an array of error messages
                  // - the main validate() method returns a promise that resolves to true or an array of error messages
                  // - We already know the current results is not true so lets ensure we have an array of errors
                  result = Array.isArray(result) ? result : [result];

                  if (Array.isArray(results)) {
                    results = results.concat(result);
                  } else {
                    results = result;
                  }
                }

              case 21:
                y++;
                _context.next = 14;
                break;

              case 24:
                x++;
                _context.next = 4;
                break;

              case 27:
                return _context.abrupt('return', results);

              case 28:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function validate(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return validate;
    }()

    // Validator function
    // - returns an error message string or an array of error messages on failure otherweise returns boolean true

  }, {
    key: 'required',
    value: function required(value, options) {
      var isValid = value !== undefined;
      var name = options && options['name'] ? options['name'] : 'field';
      var message = options && options['message'] ? options['message'] : name + ' is required';
      var result = isValid ? isValid : message;

      return result;
    }
  }, {
    key: 'notNull',
    value: function notNull(value, options) {
      var isValid = value !== null && !(
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null');
      var name = options && options['name'] ? options['name'] : 'field';
      var message = options && options['message'] ? options['message'] : name + ' cannot be null';
      var result = isValid ? isValid : message;
      return result;
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty(value) {
      var valueType = value ? TypeCaster.getType(value) : undefined;
      var result = value == undefined ||
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      valueType != Array && value == false || valueType == Number && isNaN(value) || valueType == Object && Object.keys(value).length == 0 || valueType == Array && value.length == 0;
      return result;
    }
  }, {
    key: 'notEmpty',
    value: function notEmpty(value, options) {
      var name = options && options['name'] ? options['name'] : 'field';
      var message = options && options['message'] ? options['message'] : name + ' cannot be empty';
      var result = !Validator.isEmpty(value) ? true : message;
      return result;
    }
  }, {
    key: 'regex',
    value: function regex(value, options) {
      var name = options && options['name'] ? options['name'] : 'field';
      var regex = options && options['pattern'] ? new RegExp(options['pattern']) : new RegExp();
      var message = options && options['message'] ? options['message'] : name + ' does not appear to be valid';
      var result = regex.test(value) ? true : message;
      return result;
    }
  }, {
    key: 'email',
    value: function email(value, options) {
      var name = options && options['name'] ? options['name'] : 'email';
      // We have a very loose regex pattern for validating email addresses since unicode email addresses 
      // - have been supported by modern mail servers for several years
      // - https://tools.ietf.org/html/rfc6531
      // - https://en.wikipedia.org/wiki/International_email#Email_addresses
      var regex = new RegExp(/^[^\s]+@[^\s]+\.[^\s]{2,9}$/);
      var message = options && options['message'] ? options['message'] : name + ' does not appear to be a valid address';
      var result = regex.test(value) ? true : message;
      return result;
    }
  }, {
    key: 'valueLength',
    value: function valueLength(value, options) {
      var name = options && options['name'] ? options['name'] : 'field';
      var min = options && options['min'] ? options['min'] : null;
      var max = options && options['max'] ? options['max'] : null;
      var messageMin = options && options['message'] ? options['message'] : name + ' must be at least ' + min + ' characters long';
      var messageMax = options && options['message'] ? options['message'] : name + ' must be no more than ' + max + ' characters long';

      var valueType = TypeCaster.getType(value);

      var resultMin = !min || value != null && (
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      valueType != Array && valueType != String || value.length >= min) && (valueType != Number || isNaN(value) && value >= min) && (valueType != Object || Object.keys(value).length >= min);

      var resultMax = !max || value != null && (
      // In Javascript [[]] evalulates to false - we dont want this
      // - an array is only considered empty if it has zero elements
      valueType != Array && valueType != String || value.length <= max) && (valueType != Number || isNaN(value) && value <= max) && (valueType != Object || Object.keys(value).length <= max);

      var result = resultMin && resultMax ? true : !resultMin ? messageMin : messageMax;

      return result;
    }
  }, {
    key: 'equality',
    value: function equality(value, options) {
      var name = options && options['name'] ? options['name'] : 'field';
      var root = options && options['root'] ? options['root'] : {};
      var path = options && options['path'] ? options['path'] : null;
      var message = options && options['message'] ? options['message'] : name + ' does not match';
      var result = !path || root[path] === value ? true : message;
      return result;
    }

    // Custom validator allows you to specify your own validator function 
    // - the function should return boolean true for a valid value
    // - or return an error message string or an array of error messages

  }, {
    key: 'custom',
    value: function custom(value, options) {
      var validator = options && options['validator'] ? options['validator'] : function () {
        return true;
      };
      return validator(value, options);
    }
  }]);

  return Validator;
}();

module.exports = Validator;