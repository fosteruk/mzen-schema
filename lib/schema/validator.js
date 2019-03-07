'use strict';

var TypeCaster = require('../type-caster');

class Validator {
  static async validate(value, validatorsConfig, options) {
    var results = true;
    var configKeys = Object.keys(validatorsConfig);

    for (let x = 0; x < configKeys.length; x++) {
      let validatorName = configKeys[x];
      let validatorFn = Validator[validatorName];
      if (typeof validatorFn != 'function') throw new Error('Uknown validator "' + validatorName + '"');
      if (validatorsConfig[validatorName] === false || validatorsConfig[validatorName] == undefined) continue; // Falsey value disables the validator

      let validatorConfig = !validatorsConfig[validatorName] || typeof validatorsConfig[validatorName] == 'boolean' ? {} : validatorsConfig[validatorName]; // If validatorConfig is an array we run the validator multiple times
      // - one for each validatorConfig object

      validatorConfig = Array.isArray(validatorConfig) ? validatorConfig : [validatorConfig];

      for (let y = 0; y < validatorConfig.length; y++) {
        let config = Object.assign({}, options, validatorConfig[y]); // We only validate if we dont already have an error

        if (results === true) {
          // Validate function can return a promise but it may also return boolean, string or array
          // - we must first resolve the return value to ensure we have promise
          let resultCurrent = await Promise.resolve(validatorFn(value, config));

          if (resultCurrent !== true) {
            // validator function can return either true, a single message string or an array of error messages
            // - the main validate() method returns a promise that resolves to true or an array of error messages
            // - We already know the current results is not true so lets ensure we have an array of errors
            resultCurrent = Array.isArray(resultCurrent) ? resultCurrent : [resultCurrent];
            results = Array.isArray(results) ? results.concat(resultCurrent) : resultCurrent;
          }
        }
      }
    }

    return results;
  } // Validator function
  // - returns an error message string or an array of error messages on failure otherweise returns boolean true


  static required(value, options) {
    var isValid = value !== undefined;
    var name = options && options.name ? options.name : 'field';
    var message = options && options.message ? options.message : name + ' is required';
    var result = isValid ? isValid : message;
    return result;
  }

  static notNull(value, options) {
    var isValid = value !== null && !( // The string value NULL or null are treated as a literal null
    typeof value == 'string' && value.toLowerCase() == 'null');
    var name = options && options.name ? options.name : 'field';
    var message = options && options.message ? options.message : name + ' cannot be null';
    var result = isValid ? isValid : message;
    return result;
  }

  static isEmpty(value) {
    var valueType = value ? TypeCaster.getType(value) : undefined;
    var result = value == undefined || // In Javascript [[]] evalulates to false - we dont want this
    // - an array is only considered empty if it has zero elements
    valueType != Array && value == false || valueType == Number && isNaN(value) || valueType == Object && Object.keys(value).length == 0 || valueType == Array && value.length == 0;
    return result;
  }

  static notEmpty(value, options) {
    var name = options && options.name ? options.name : 'field';
    var message = options && options.message ? options.message : name + ' cannot be empty';
    var result = !Validator.isEmpty(value) ? true : message;
    return result;
  }

  static regex(value, options) {
    var name = options && options.name ? options.name : 'field';
    var regex = options && options.pattern ? new RegExp(options.pattern) : new RegExp();
    var message = options && options.message ? options.message : name + ' does not appear to be valid';
    var result = regex.test(value) ? true : message;
    return result;
  }

  static email(value, options) {
    var name = options && options.name ? options.name : 'email'; // We have a very loose regex pattern for validating email addresses since unicode email addresses
    // - have been supported by modern mail servers for several years
    // - https://tools.ietf.org/html/rfc6531
    // - https://en.wikipedia.org/wiki/International_email#Email_addresses

    var regex = new RegExp(/^[^\s]+@[^\s]+\.[^\s]{2,9}$/);
    var message = options && options.message ? options.message : name + ' does not appear to be a valid address';
    var result = regex.test(value) ? true : message;
    return result;
  }

  static valueLength(value, options) {
    var name = options && options.name ? options.name : 'field';
    var min = options && options.min ? options.min : null;
    var max = options && options.max ? options.max : null;
    var messageMin = options && options.message ? options.message : name + ' must be at least ' + min + ' characters long';
    var messageMax = options && options.message ? options.message : name + ' must be no more than ' + max + ' characters long';
    var valueType = TypeCaster.getType(value);
    var resultMin = !min || value != null && ( // In Javascript [[]] evalulates to false - we dont want this
    // - an array is only considered empty if it has zero elements
    valueType != Array && valueType != String || value.length >= min) && (valueType != Number || isNaN(value) && value >= min) && (valueType != Object || Object.keys(value).length >= min);
    var resultMax = !max || value == null || // In Javascript [[]] evalulates to false - we dont want this
    // - an array is only considered empty if it has zero elements
    (valueType != Array && valueType != String || value.length <= max) && (valueType != Number || isNaN(value) && value <= max) && (valueType != Object || Object.keys(value).length <= max);
    var result = resultMin && resultMax ? true : !resultMin ? messageMin : messageMax;
    return result;
  }

  static equality(value, options) {
    var name = options && options.name ? options.name : 'field';
    var root = options && options.root ? options.root : {};
    var path = options && options.path ? options.path : null;
    var message = options && options.message ? options.message : name + ' does not match';
    var result = !path || root[path] === value ? true : message;
    return result;
  }

  static enumeration(value, options) {
    var name = options && options.name ? options.name : 'field';
    var values = options && options.values ? options.values : [];
    var message = options && options.message ? options.message : name + ' is invalid';
    return Array.isArray(values) && values.indexOf(value) !== -1 || message;
  } // Custom validator allows you to specify your own validator function
  // - the function should return boolean true for a valid value
  // - or return an error message string or an array of error messages


  static custom(value, options) {
    var validator = options && options.validator ? options.validator : () => true;
    return validator(value, options);
  }

}

module.exports = Validator;