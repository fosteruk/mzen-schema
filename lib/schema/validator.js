'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypeCaster = require('../type-caster');

var Validator = function () {
  function Validator() {
    _classCallCheck(this, Validator);
  }

  _createClass(Validator, null, [{
    key: 'validate',
    value: function validate(value, validators, name, root) {
      var results = true;
      var promises = [];

      var promise = Promise.resolve();
      Object.keys(validators).forEach(function (validatorName) {
        var validator = Validator[validatorName];
        if (validator == undefined) throw new Error('Uknown validator "' + validatorName + '"');

        var options = !validators[validatorName] || typeof validators[validatorName] == 'boolean' ? {} : validators[validatorName];
        // If options is an array we run the validator multiple times 
        // - one for each options object id
        options = Array.isArray(options) ? options : [options];

        options.forEach(function (opts) {
          promise = promise.then(function () {
            // We only validate if we dont already have an error 
            if (results === true) {
              // Validate fucntion can return a promise but it may also return boolean, string or array
              // - we must first resolve the return value to ensure we have promise
              return Promise.resolve(validator(value, opts, name, root)).then(function (result) {
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
              });
            }
          });
        });
      });

      var promise = promise.then(function () {
        return results;
      });

      return promise;
    }

    // Validator function
    // - returns an error message string or an array of error messages on failure otherweise returns boolean true

  }, {
    key: 'required',
    value: function required(value, options, name, root) {
      var isValid = value !== undefined;

      var name = options && options['name'] ? options['name'] : name;
      var message = options && options['message'] ? options['message'] : name + ' is required';
      var result = isValid ? isValid : message;

      return result;
    }
  }, {
    key: 'notNull',
    value: function notNull(value, options, name, root) {
      var isValid = value !== null && !(
      // The string value NULL or null are treated as a literal null
      typeof value == 'string' && value.toLowerCase() == 'null');
      var name = options && options['name'] ? options['name'] : name;
      var message = options && options['message'] ? options['message'] : name + ' cannot be null';
      var result = isValid ? isValid : message;
      return result;
    }
  }, {
    key: 'notEmpty',
    value: function notEmpty(value, options, name, root) {
      function isEmpty(value) {
        var valueType = value ? TypeCaster.getType(value) : undefined;
        var result = value == undefined ||
        // In Javascript [[]] evalulates to false - we dont want this
        // - an array is only considered empty if it has zero elements
        valueType != Array && value == false || valueType == Number && isNaN(value) || valueType == Object && Object.keys(value).length == 0 || valueType == Array && value.length == 0;
        return result;
      }
      var name = options && options['name'] ? options['name'] : name;
      var message = options && options['message'] ? options['message'] : name + ' cannot be empty';
      var result = !isEmpty(value) ? true : message;
      return result;
    }
  }, {
    key: 'regex',
    value: function regex(value, options, name, root) {
      var regex = options && options['pattern'] ? new RegExp(options['pattern']) : new RegExp();
      var message = options && options['message'] ? options['message'] : name + ' does not appear to be valid';
      var result = regex.test(value) ? true : message;
      return result;
    }
  }, {
    key: 'email',
    value: function email(value, options, name, root) {
      var regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      var name = options && options['name'] ? options['name'] : name;
      var message = options && options['message'] ? options['message'] : name + ' does not appear to be a valid email address';
      var result = regex.test(value) ? true : message;
      return result;
    }
  }, {
    key: 'length',
    value: function length(value, options, name, root) {
      var min = options && options['min'] ? options['min'] : null;
      var max = options && options['max'] ? options['max'] : null;
      var name = options && options['name'] ? options['name'] : name;
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
    value: function equality(value, options, name, root) {
      var path = options && options['path'] ? options['path'] : null;
      var name = options && options['name'] ? options['name'] : name;
      var message = options && options['message'] ? options['message'] : name + ' does not match';
      var result = !path || root[path] === value ? true : message;
      return result;
    }

    // Custom validator allows you to specify your own validator function 
    // - the function should return boolean true for a valid value
    // - or return an error message string or an array of error messages

  }, {
    key: 'custom',
    value: function custom(value, options, name, root) {
      var validator = options && options['validator'] ? options['validator'] : function () {
        return true;
      };
      return validator(value, options, name, root);
    }
  }]);

  return Validator;
}();

module.exports = Validator;