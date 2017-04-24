# mZen-schema
## Data schema's in Javascript

Features:
  - Define data structures as schema
  - Validate and type-cast against defined data types
  - Specify validation rules for each field
  - Populate default values from schema

Initially designed for use with the mZen domain modeling package but has no dependency on mZen.


```javascript
var Schema = require('mzen-schema');

var schemaPerson = new Schema({
  _id: 'ObjectID',
  name: {
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
      regex: {pattern: '^[0-9]+$', message: 'Tel does not appear to be valid'} 
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

// Calling Schema.validate() will type-cast and validate the data against the schema
// The validate() method returns a result object with meta data
// Two useful values returned are 'isValid' and 'errors'
var result = schemaPerson.validate(paul);
if (result.isValid) {
  // Do something with valid user
} else {
  console.log(result.errors);
}
```
