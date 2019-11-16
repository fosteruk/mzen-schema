import should = require('should');
import Schema from '../../lib/schema';
import Types from '../../lib/types';

describe('validation', function(){
  it('should ignore schema of relations', async () => {
    // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
    var data = {name: [1]};

    var schemaAddress = new Schema({
      $name: 'address',
      street: [{$type: 'String', $validate: {notNull: true}}],
    });

    var schema = new Schema({
      name: [{$type: 'Mixed', $validate: {notNull: true}}],
      address: {$schemaRelation: 'address'}
    });
    schema.addSchema(schemaAddress);

    const result = await schema.validate(data);
    should(result.isValid).eql(true);
  });
  it('should skip validation for null $nullable object', async () => {
    var schema = new Schema({
      user: {
        name: String,
        address: {
          street: {$type: String, $validate: {required: true}}
        }
      }
    });
    const resultFail = await schema.validate({
      user: {
        name: 'Kevin',
<<<<<<< HEAD
        address: null // missing required "street"
=======
        address: {
          // missing street!
        }
>>>>>>> 22a5db03986c053052242bcfdfb9b3a356e919eb
      }
    });
    should(resultFail.isValid).eql(false);

    var data = {
      user: {
        name: 'Kevin',
        address: null
      }
    };

    var schema = new Schema({
      user: {
        name: String,
        address: {
          $nullable: true,
          street: {$validate: {required: true}}
        }
      }
    });

    const result = await schema.validate(data);
    should(result.isValid).eql(true);
    should(data.user.address).eql(null);
  });
  describe('required', function(){
    describe('should validate required field', function(){
      it('valid', async () => {
        var data = {house: 1};

        var schema = new Schema({
          house: {$type: Number, $validate: {required: true}}
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(true);
      });
      it('invalid', async () => {
        var data = {other: 1};

        var schema = new Schema({
          house: {$type: Number, $validate: {required: true}}
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(false);
      });
    });
    it('should accept a null value to satisfy required setting', async () => {
      // The 'required' option simply specifies that the field exists regardless of its value
      var data = {name: null};

      var schema = new Schema({
        name: {$validate: {required: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    describe('should validate required embedded field', function(){
      it('valid', async () => {
        var data = {house: {bedRooms: '3', discounted: '1'}};

        var schema = new Schema({
          house: {
            bedRooms: Number,
            discounted: {$type: Boolean, $validate: {required: true}},
          }
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(true);
      });
      it('invalid', async () => {
        var data = {house: {bedRooms: '2'}};

        var schema = new Schema({
          house: {
            bedRooms: Number,
            discounted: {$type: Boolean, $validate: {required: true}},
          }
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(false);
      });
    });
    describe('should validate required embedded field when given array of objects', function(){
      it('valid', async () => {
        var data = [
          {house: {bedRooms: '3', discounted: '1'}},
          {house: {bedRooms: '2', discounted: '0'}}
        ];

        var schema = new Schema({
          house: {
            bedRooms: Number,
            discounted: {$type: Boolean, $validate: {required: true}},
          }
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(true);
      });
      it('invalid', async () => {
        var data = [
          {house: {bedRooms: '3', discounted: '1'}},
          {house: {bedRooms: '2'}}
        ];

        var schema = new Schema({
          house: {
            bedRooms: Number,
            discounted: {$type: Boolean, $validate: {required: true}},
          }
        });

        const result = await schema.validate(data);
        should(result.isValid).eql(false);
      });
    });
  });
  describe('should validate notNull field', function(){
    it('valid', async () => {
      var data = {name: 'Kevin'};

      var schema = new Schema({
        name: {$type: String, $validate: {notNull: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid', async () => {
      var data = {name: null};

      var schema = new Schema({
        name: {$type: String, $validate: {notNull: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('falsey value disables validator - false', async () => {
      var data = {name: null};

      var schema = new Schema({
        name: {$type: String, $validate: {notNull: false}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('falsey value disables validator - undefined', async () => {
      var data = {name: null};

      var schema = new Schema({
        name: {$type: String, $validate: {notNull: undefined}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('falsey value disables validator - null', async () => {
      var data = {name: null};

      var schema = new Schema({
        name: {$type: String, $validate: {notNull: null}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
  });
  describe('should validate notEmpty field', function(){
    it('valid - not empty string', async () => {
      // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
      var data = {name: 'Kevin'};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - undefined', async () => {
      // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
      var data = {name: undefined};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - null', async () => {
      var data = {name: null};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - false', async () => {
      var data = {name: false};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - zero', async () => {
      var data = {name: 0};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - empty string', async () => {
      var data = {name: ''};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('valid - not empty array', async () => {
      var data = {name: [1]};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - empty array', async () => {
      var data = {name: []};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('valid - empty array contains empty array', async () => {
      var data = {name: [[]]};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - not empty object', async () => {
      var validDataNotEmptyObject = {name: {test: 1}};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(validDataNotEmptyObject);
      should(result.isValid).eql(true);
    });
    it('invalid - empty object', async () => {
      var data = {name: {}};

      var schema = new Schema({
        name: {$type: Types.Mixed, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
  });
  describe('should validate notEmpty object with spec', function(){
    it('valid', async () => {
      // An empty object is an object with zero fields
      var data = {name: {first: 'Kevin'}};

      var schema = new Schema({
        name: {$type: 'Object', $spec: {
          first: {$type: String, $validate: {notEmpty: true}}
        }}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - undefined', async () => {
      var data = {name: undefined};

      var schema = new Schema({
        name: {$type: 'Object', $spec: {
          first: {$type: String, $validate: {notEmpty: true}}
        }}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - null', async () => {
      var data = {name: undefined};

      var schema = new Schema({
        name: {$type: 'Object', $spec: {
          first: {$type: String, $validate: {notEmpty: true}}
        }}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('valid - not empty object', async () => {
      var data = {name: {other: 1}};

      var schema = new Schema({
        name: {$type: 'Object', $validate: {notEmpty: true}, $spec: {
          first: {$type: String}
        }}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - empty object', async () => {
      var data = {name: {}};

      var schema = new Schema({
        name: {$type: 'Object', $validate: {notEmpty: true}, $spec: {
        }}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
  });
  describe('should validate notEmpty array with spec', function(){
    it('valid', async () => {
      // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
      var data = {name: [1]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of array', async () => {
      var data = {name: [[1]]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of zero', async () => {
      var data = {name: [0]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of null', async () => {
      var data = {name: [null]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of undefined', async () => {
      var data = {name: [undefined]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of false', async () => {
      var data = {name: [false]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of empty array', async () => {
      var data = {name: [[]]};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - empty array', async () => {
      var data = {name: []};

      var schema = new Schema({
        name: {$type: Array, $validate: {notEmpty: true}}
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
  });
  describe('should validate notEmpty on array elements with mixed type values', function(){
    it('valid - array of 1', async () => {
      // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
      var data = {name: [1]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - array of array of 1', async () => {

      var data = {name: [[1]]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - array of zero', async () => {
      var data = {name: [0]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - array of null', async () => {
      var data = {name: [null]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - array of undefined', async () => {
      var data = {name: [undefined]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - array of false', async () => {
      var data = {name: [false]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('invalid - array of empty array', async () => {
      var data = {name: [[]]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
  });
  describe('should validate notNull on array elements with mixed type values', function(){
    it('valid - valid array of 1', async () => {
      // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
      var data = {name: [1]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notNull: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('valid - valid array of array of 1', async () => {
      var data = {name: [[1]]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notNull: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
    it('invalid - array of null', async () => {
      var data = {name: [null]};

      var schema = new Schema({
        name: [{$type: 'Mixed', $validate: {notNull: true}}]
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
  });
  it('should fail validation if attempt to cast object to primitive', async () => {
    var data = {person: {age: '33'}};

    var schema = new Schema({
      person: String
    });

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
  });
  describe('strict', function(){
    it('should fail validation in strict mode if unspecified field exists', async () => {
      var data = {age: '33', pi: '3.14159265359'};

      var schema = new Schema({
        $strict: true,
        age: Number
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('should fail validation, strict mode propagates', async () => {
      var data = {
        name: 'Kevin',
        address: {
          street: 'London Road',
          city: 'Liverpool'
        }
      };

      var schema = new Schema({
        $strict: true,
        name: 'string',
        address: {
          street: 'string',
        }
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('should fail validation, strict mode propagates deep', async () => {
      var data = {
        a: {
          b: {
            name: 'Kevin',
            address: {
              street: 'London Road',
              city: 'Liverpool'
            }
          }
        }
      };

      var schema = new Schema({
        $strict: true,
        a: {
          b: {
            name: String,
            address: {
              street: String
            }
          }
        }
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(false);
    });
    it('should allow strict mode propagation to be overriden', async () => {
      var data = {
        name: 'Kevin',
        address: {
          street: 'London Road',
          city: 'Liverpool'
        }
      };

      var schema = new Schema({
        $strict: true,
        name: String,
        address: {
          $strict: false,
          street: String
        }
      });

      const result = await schema.validate(data);
      should(result.isValid).eql(true);
    });
  });
  it('should honour defaultNotNull value', async () => {
    var data = {name: null};

    var schema = new Schema({name: String}, {defaultNotNull: true});

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
  });
  it('should honour defaultNotNull value even if field is not defined in spec', async () => {
    var data = {name: {first: null}};

    var schema = new Schema({name: {last: String}}, {defaultNotNull: true});

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
  });
  it('should populate errors object on failure', async () => {
    var data = {other: 1};

    var schema = new Schema({
      house: {$type: Number, $validate: {required: true}}
    });

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
    should(result.errors).is.Object();
    // @ts-ignore - 'house' does not exist on type 'object'
    should(result.errors.house).is.Array(); // Error messages are returned as an array of strings
  });
  it('should populate custom error message on failure', async () => {
    var data = {other: 1};

    var schema = new Schema({
      house: {$type: Number, $validate: {required: true}}
    });

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
    // @ts-ignore - 'house' does not exist on type 'object'
    should(result.errors.house[0]).equal('house is required'); // Error messages are returned as an array of strings
  });
  it('should use custom label in error message', async () => {
    var data = {other: 1};

    var schema = new Schema({
      house: {$label: 'House number', $type: Number, $validate: {required: true}}
    });

    const result = await schema.validate(data);
    should(result.isValid).eql(false);
    // @ts-ignore - 'house' does not exist on type 'object'
    should(result.errors.house[0]).equal('House number is required'); // Error messages are returned as an array of strings
  });
});
