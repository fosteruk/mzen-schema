# mZen-schema
## Data schema's in Javascript

Features:
  - Define Javascript data structure Schemas
  - Specify validation rules and default values
  - Validate, type-cast and populate default values
  - Define schema relations
  
```javascript
import Schema from 'mzen-schema';
// var Schema = require('mzen-schema').default; // commonjs

var schemaPerson = new Schema({
  // field names with a $ prefix are used to specify options in the schema specification
  $name: 'person', // A schema can be referenced in other schema's by name to allow composition
  $strict: true, // in strict mode any undefined fields will produce an error on validation
  _id: 'ObjectID',
  name: {
    // $label used in validation error message - defaults to the field name
    $label: 'Name',
    $type: String,
    $validate: {
      required: true,
      valueLength: {min: 1, max: 50}
    },
    $filter: {defaultValue: 'Unknown'}
  },
  created: Date,
  contact: {
    address: String,
    tel: {$type: String, $validate: {
      required: true,
      // Use a single validator multiple times
      // - Specify an array of options rather than an object
      // - Validator will be executed once per options object
      regex: [
        {
          pattern: '[+0-9]+',
          message: 'Tel does not appear to be valid'
        },
        {
          pattern: '^\+[0-9]{2}',
          message: 'Tel must start with your country code (e.g. +44)'
        }
      ]
    }
  }
});

var paul = {
  name: 'Paul',
  contact: {
    address: '123 Street, UK',
    tel: 0123456789
  }
};

// Calling Schema.validate() will type-cast and validate
// the data against the schema
// The validate() method returns a result object with meta data
// Two useful values returned are 'isValid' and 'errors'
(async () => {

  await validationResult = schemaPerson.validate(paul);
  if (validationResult.isValid) {
    // Do something with valid user
  } else {
    console.log(result.errors);
  }

})();
```
