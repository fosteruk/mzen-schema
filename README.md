# mZen-schema
## Data schema's in Javascript

Features:
  - Define data structures as schema
  - Validate and type-cast against defined data types
  - Specify validation rules for each field
  - Populate default values from schema
  - Reuse schema's by referencing them within other schemas

Initially designed for use with the mZen ORM package but has no dependency on mZen.


```javascript
var Schema = require('mzen-schema');

var schemaPerson = new Schema({
  // field names with a $ prefix are used to specify options in the schema specification
  $name: 'person', // A schema can be referenced in other schema's by name to allow composition
  $strict: true, // in strict mode any undefined fields will produce an error on validation
  _id: 'ObjectID',
  name: {
    // $displayName specifies the name that will be used in any validation error message
    // - defaults to the field name
    $displayName: 'Name',
    $type: String,
    $validate: {
      required: true,
      length: {min: 1, max: 50}
    },
    $filter: {defaultValue: 'Unknown'}
  },
  created: Date,
  contact: {
    address: String,
    tel: {$type: String, $validate: {
      required: true,
      // You can use the same validator multiple times
      // - just specify an array of options rather than an object
      // - The validator will be executed once per options object
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
var result = schemaPerson.validate(paul).then((result) => {
  if (result.isValid) {
    // Do something with valid user
  } else {
    console.log(result.errors);
  }
});
```
