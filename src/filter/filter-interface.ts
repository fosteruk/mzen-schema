export interface FilterInterface
{
  filter(value: any, options?): boolean | [string];
  getName(): string;
}

export default FilterInterface;
