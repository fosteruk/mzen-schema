interface ValidatorInterface
{
  validate(value: any, options?): boolean | [string];
  getName(): string;
}

export default ValidatorInterface;
