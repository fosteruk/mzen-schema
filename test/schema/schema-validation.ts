import should = require('should');
import Schema from '../../lib/schema';
import Types from '../../lib/types';

describe('Schema', function() {
  describe('validation', function() {
    it('should ignore schema of relations', function(done) {
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

      schema.validate(data).then((results) => {
        should(results.isValid).eql(true);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    describe('required', function() {
      describe('should validate required field', function() {
        it('valid', function(done) {
          var data = {house: 1};

          var schema = new Schema({
            house: {$type: Number, $validate: {required: true}}
          });

          schema.validate(data).then((result) => {
            should(result.isValid).eql(true);
            done();
          }).catch((error) => {
            done(error);
          });
        });
        it('invalid', function(done) {
          var data = {other: 1};

          var schema = new Schema({
            house: {$type: Number, $validate: {required: true}}
          });

          schema.validate(data).then((result) => {
            should(result.isValid).eql(false);
            done();
          }).catch((error) => {
            done(error);
          });
        });
      });
      it('should accept a null value to satisfy required setting', function(done) {
        // The 'required' option simply specifies that the field exists regardless of its value
        var data = {name: null};

        var schema = new Schema({
          name: {$validate: {required: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      describe('should validate required embedded field', function() {
        it('valid', function(done) {
          var data = {house: {bedRooms: '3', discounted: '1'}};

          var schema = new Schema({
            house: {
              bedRooms: Number,
              discounted: {$type: Boolean, $validate: {required: true}},
            }
          });

          schema.validate(data).then((result) => {
            should(result.isValid).eql(true);
            done();
          }).catch((error) => {
            done(error);
          });
        });
        it('invalid', function(done) {
          var data = {house: {bedRooms: '2'}};

          var schema = new Schema({
            house: {
              bedRooms: Number,
              discounted: {$type: Boolean, $validate: {required: true}},
            }
          });

          schema.validate(data).then((result) => {
            should(result.isValid).eql(false);
            done();
          }).catch((error) => {
            done(error);
          });
        });
      });
      describe('should validate required embedded field when given array of objects', function() {
        it('valid', function(done) {
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

          schema.validate(data).then((result) => {
            should(result.isValid).eql(true);
            done();
          }).catch((error) => {
            done(error);
          });
        });
        it('invalid', function(done) {
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

          schema.validate(data).then((result) => {
            should(result.isValid).eql(false);
            done();
          }).catch((error) => {
            done(error);
          });
        });
      });
    });
    describe('should validate notNull field', function() {
      it('valid', function(done) {
        var data = {name: 'Kevin'};

        var schema = new Schema({
          name: {$type: String, $validate: {notNull: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid', function(done) {
        var data = {name: null};

        var schema = new Schema({
          name: {$type: String, $validate: {notNull: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('falsey value disables validator - false', function(done) {
        var data = {name: null};

        var schema = new Schema({
          name: {$type: String, $validate: {notNull: false}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('falsey value disables validator - undefined', function(done) {
        var data = {name: null};

        var schema = new Schema({
          name: {$type: String, $validate: {notNull: undefined}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('falsey value disables validator - null', function(done) {
        var data = {name: null};

        var schema = new Schema({
          name: {$type: String, $validate: {notNull: null}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('should validate notEmpty field', function() {
      it('valid - not empty string', function(done) {
        // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
        var data = {name: 'Kevin'};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - undefined', function(done) {
        // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
        var data = {name: undefined};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - null', function(done) {
        var data = {name: null};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - false', function(done) {
        var data = {name: false};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - zero', function(done) {
        var data = {name: 0};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - empty string', function(done) {
        var data = {name: ''};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - not empty array', function(done) {
        var data = {name: [1]};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((result) => {
          should(result.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - empty array', function(done) {
        var data = {name: []};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - empty array contains empty array', function(done) {
        var data = {name: [[]]};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - not empty object', function(done) {
        var validDataNotEmptyObject = {name: {test: 1}};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(validDataNotEmptyObject).then((results) => {
          should(results.isValid).eql(true);
          done();
        });
      });
      it('invalid - empty object', function(done) {
        var data = {name: {}};

        var schema = new Schema({
          name: {$type: Types.Mixed, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('should validate notEmpty object with spec', function() {
      it('valid', function(done) {
        // An empty object is an object with zero fields
        var data = {name: {first: 'Kevin'}};

        var schema = new Schema({
          name: {$type: 'Object', $spec: {
            first: {$type: String, $validate: {notEmpty: true}}
          }}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - undefined', function(done) {
        var data = {name: undefined};

        var schema = new Schema({
          name: {$type: 'Object', $spec: {
            first: {$type: String, $validate: {notEmpty: true}}
          }}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - null', function(done) {
        var data = {name: undefined};

        var schema = new Schema({
          name: {$type: 'Object', $spec: {
            first: {$type: String, $validate: {notEmpty: true}}
          }}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - not empty object', function(done) {
        var data = {name: {other: 1}};

        var schema = new Schema({
          name: {$type: 'Object', $validate: {notEmpty: true}, $spec: {
            first: {$type: String}
          }}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - empty object', function(done) {
        var data = {name: {}};

        var schema = new Schema({
          name: {$type: 'Object', $validate: {notEmpty: true}, $spec: {
          }}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('should validate notEmpty array with spec', function() {
      it('valid', function(done) {
        // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
        var data = {name: [1]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of array', function(done) {
        var data = {name: [[1]]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of zero', function(done) {
        var data = {name: [0]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of null', function(done) {
        var data = {name: [null]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of undefined', function(done) {
        var data = {name: [undefined]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of false', function(done) {
        var data = {name: [false]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of empty array', function(done) {
        var data = {name: [[]]};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - empty array', function(done) {
        var data = {name: []};

        var schema = new Schema({
          name: {$type: Array, $validate: {notEmpty: true}}
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('should validate notEmpty on array elements with mixed type values', function() {
      it('valid - array of 1', function(done) {
        // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
        var data = {name: [1]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - array of array of 1', function(done) {

        var data = {name: [[1]]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - array of zero', function(done) {
        var data = {name: [0]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - array of null', function(done) {
        var data = {name: [null]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - array of undefined', function(done) {
        var data = {name: [undefined]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        });
      });
      it('invalid - array of false', function(done) {
        var data = {name: [false]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - array of empty array', function(done) {
        var data = {name: [[]]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notEmpty: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('should validate notNull on array elements with mixed type values', function() {
      it('valid - valid array of 1', function(done) {
        // An empty field is any falsy value: undefined, null, false, 0, '', [], {}
        var data = {name: [1]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notNull: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('valid - valid array of array of 1', function(done) {
        var data = {name: [[1]]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notNull: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(true);
          done();
        }).catch((error) => {
          done(error);
        });
      });
      it('invalid - array of null', function(done) {
        var data = {name: [null]};

        var schema = new Schema({
          name: [{$type: 'Mixed', $validate: {notNull: true}}]
        });

        schema.validate(data).then((results) => {
          should(results.isValid).eql(false);
          done();
        });
      });
    });
    it('should fail validation if attempt to cast object to primitive', function(done) {
      var data = {person: {age: '33'}};

      var schema = new Schema({
        person: String
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should fail validation in strict mode if unspecified field exists', function(done) {
      var data = {age: '33', pi: '3.14159265359'};

      var schema = new Schema({
        $strict: true,
        age: Number
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should fail validation in strict mode should propagate', function(done) {
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
          street: String
        }
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should fail validation in strict mode should propagation can be overriden', function(done) {
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

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should honour defaultNotNull value', function(done) {
      var data = {name: null};

      var schema = new Schema({name: String}, {defaultNotNull: true});

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      });
    });
    it('should honour defaultNotNull value even if field is not defined in spec', function(done) {
      var data = {name: {first: null}};

      var schema = new Schema({name: {last: String}}, {defaultNotNull: true});

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should populate errors object on failure', function(done) {
      var data = {other: 1};

      var schema = new Schema({
        house: {$type: Number, $validate: {required: true}}
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        should(results.errors).is.Object();
        // @ts-ignore - 'house' does not exist on type 'object'
        should(results.errors.house).is.Array(); // Error messages are returned as an array of strings
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should populate custom error message on failure', function(done) {
      var data = {other: 1};

      var schema = new Schema({
        house: {$type: Number, $validate: {required: true}}
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        // @ts-ignore - 'house' does not exist on type 'object'
        should(results.errors.house[0]).equal('house is required'); // Error messages are returned as an array of strings
        done();
      }).catch((error) => {
        done(error);
      });
    });
    it('should use custom name in error message', function(done) {
      var data = {other: 1};

      var schema = new Schema({
        house: {$displayName: 'House number', $type: Number, $validate: {required: true}}
      });

      schema.validate(data).then((results) => {
        should(results.isValid).eql(false);
        // @ts-ignore - 'house' does not exist on type 'object'
        should(results.errors.house[0]).equal('House number is required'); // Error messages are returned as an array of strings
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });
});
