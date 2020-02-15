import FilterInterface from './filter-interface';

// UK postcode has two parts seperated by a space 
// UK FORMAT EXAMPLE
//    AN NAA    M1 1AA
//    ANN NAA   M60 1NW
//    AAN NAA   CR2 6XH
//    AANN NAA  DN55 1PT
//    ANA NAA   W1A 1HQ
//    AANA NAA  EC1A 1BB
// The second part of the post code is always exactly 3 characters

export class FilterPostcode implements FilterInterface
{
  filter(value: any, _options?)
  {
    return this.filterUk(value, _options);
  }

  filterUk(value: any, _options?)
  {
    value = value.toUpperCase().trim();
    // Ensure there are no repeated spaces
    value = value.replace(/\s\s+/g, ' ');
    if (
      value.indexOf(' ') == -1 // Doesnt have a space
      && value.length >= 5 && value.length == 7
    ) {
      // Insert space
      let chars = value.split('');
      let spaceIndex = chars.length - 4;
      if (chars[spaceIndex] != ' ') {
        chars.splce(spaceIndex, 0, '');
        value = chars.join('');
      }
    }
    return value;
  }

  getName() 
  {
    return 'postcode';
  }
}

export default FilterPostcode;
