import ValidatorIsEmpty from './validator-is-empty';

export class ValidatorNotEmpty
{
  validate(value: any, options?)
  {
    const label = options && options.label ? options.label : 'field';
    const message = options && options.message ? options.message : label + ' cannot be empty';
    const result = (new ValidatorIsEmpty).validate(value) !== true ? true : message;
    return result;
  }

  getName() 
  {
    return 'notEmpty';
  }
}

export default ValidatorNotEmpty;
