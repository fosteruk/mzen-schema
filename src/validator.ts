import ValidatorInterface from './validator/validator-interface';
import ValidatorCustom from './validator/validator-custom';
import ValidatorEmail from './validator/validator-email';
import ValidatorInArray from './validator/validator-in-array';
import ValidatorEquality from './validator/validator-equality';
import ValidatorIsEmpty from './validator/validator-is-empty';
import ValidatorNotEmpty from './validator/validator-not-empty';
import ValidatorNotNull from './validator/validator-not-null';
import ValidatorRegex from './validator/validator-regex';
import ValidatorRequired from './validator/validator-required';
import ValidatorValueLength from './validator/validator-value-length';

export class Validator
{
  static validators = {};

  static async validate(value: any, validatorsConfig: any, options?)
  {
    var results = true;

    var configKeys = Object.keys(validatorsConfig);
    for (let x = 0; x < configKeys.length; x++) {
      let validatorName = configKeys[x];
      let validator = this.validators[validatorName];
      if (!validator) throw new Error('Uknown validator "' + validatorName + '"');

      if (validatorsConfig[validatorName] === false || validatorsConfig[validatorName] == undefined) continue; // Falsey value disables the validator

      let validatorConfig = !validatorsConfig[validatorName] || (typeof validatorsConfig[validatorName] == 'boolean')
                              ? {} : validatorsConfig[validatorName];
      // If validatorConfig is an array we run the validator multiple times
      // - one for each validatorConfig object
      validatorConfig = Array.isArray(validatorConfig) ? validatorConfig : [validatorConfig];

      for (let y = 0; y < validatorConfig.length; y++) {
        let config = Object.assign({}, options, validatorConfig[y]);
        // We only validate if we dont already have an error
        if (results === true) {
          // Validate function can return a promise but it may also return boolean, string or array
          // - we must first resolve the return value to ensure we have promise
          let resultCurrent = await Promise.resolve(validator.validate(value, config));
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
  }

  static addValidator(handler: ValidatorInterface, name?: string)
  {
    name = name ? name : handler.getName();
    this.validators[name] = handler;
  }
}

// Add default validators
Validator.addValidator(new ValidatorCustom);
Validator.addValidator(new ValidatorEmail);
Validator.addValidator(new ValidatorInArray);
Validator.addValidator(new ValidatorEquality);
Validator.addValidator(new ValidatorIsEmpty);
Validator.addValidator(new ValidatorNotEmpty);
Validator.addValidator(new ValidatorNotNull);
Validator.addValidator(new ValidatorRegex);
Validator.addValidator(new ValidatorRequired);
Validator.addValidator(new ValidatorValueLength);

export default Validator;
