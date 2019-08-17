import ValidatorIsEmpty from './validator-is-empty';

export class ValidatorNotEmpty
{
  validate(value: any, options?)
  {
    const name = options && options.label ? options.label : 'field';
    const message = options && options.message ? options.message : name + ' cannot be empty';
    const result = !(new ValidatorIsEmpty).validate(value) ? true : message;
    return result;
  }

  getName() 
  {
    return 'notEmpty';
  }
}

export default ValidatorNotEmpty;
