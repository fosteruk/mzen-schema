export class ValidatorEmail
{
  validate(value: any, options?)
  {
    const name = options && options.label ? options.label : 'email';
    // We have a very loose regex pattern for validating email addresses since unicode email addresses
    // - have been supported by modern mail servers for several years
    // - https://tools.ietf.org/html/rfc6531
    // - https://en.wikipedia.org/wiki/International_email#Email_addresses
    const regex = new RegExp(/^([^\s@]+)@([^\s@]+\.[^\s@]{2,9})$/u);
    const message = options && options.message ? options.message : name + ' does not appear to be a valid address';
    const result = regex.test(value) ? true : message;
    return result;
  }

  getName() 
  {
    return 'email';
  }
}

export default ValidatorEmail;
