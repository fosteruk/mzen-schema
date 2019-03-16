import should = require('should');
import Schema from '../../lib/schema';
import ObjectID from 'bson-objectid';


describe('Schema', function() {
  describe('default value', function() {
    it('should inject default value when undefined', function(done) {
      var data = {} as {house: number};

      var schema = new Schema({
        house: {$type: Number, $filter: {defaultValue: 5}}
      });

      schema.validate(data).then(() => {
        should(data.house).eql(5);
        done();
      });
    });
    it('should inject default function value when undefined', function(done) {
      var data = {} as {created: Date};

      var schema = new Schema({
        created: {$type: Date, $filter: {defaultValue: () => new Date}}
      });

      schema.validate(data).then(() => {
        should(data.created.constructor.name).eql('Date');
        done();
      });
    });
    it('should inject default value when undefined using $spec', function(done) {
      var data = {} as {house: number};

      var schema = new Schema({
        $type: Object,
        $spec: {
          house: {$type: Number, $filter: {defaultValue: 5}}
        }
      });

      schema.validate(data).then(() => {
        should(data.house).eql(5);
        done();
      }).catch((e) => {
        done(e);
      });
    });
    it('should typecast default string to date', function(done) {
      var data = {} as {created: Date};

      var schema = new Schema({
        created: {$type: Date, $filter: {defaultValue: 'now'}}
      });

      schema.validate(data).then(() => {
        should(data.created.constructor.name).eql('Date');
        done();
      });
    });
    it('should inject default value when null', function(done) {
      var data = {} as {house: number};

      var schema = new Schema({
        house: {$type: Number, $filter: {defaultValue: 5}}
      });

      schema.validate(data).then(() => {
        should(data.house).eql(5);
        done();
      });
    });
    it('should inject default value when null, even when defined as not null', function(done) {
      var data = {} as {house: number};

      var schema = new Schema({
        house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: 5}}
      });

      schema.validate(data).then(() => {
        should(data.house).eql(5);
        done();
      });
    });
    describe('should validate injected default value', function() {
      it('valid not null', function(done) {
        var schema = new Schema({
          house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: 5}}
        });

        schema.validate({}).then((results) => {
          should(results.isValid).eql(true);
          done();
        });
      });
      it('invalid not null', function(done) {
        var schema = new Schema({
          house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: null}}
        });

        schema.validate({}).then((results) => {
          should(results.isValid).eql(false);
          done();
        });
      });
      it('invalid not empty', function(done) {
        var schema = new Schema({
          house: {$type: Number, $validate: {notEmpty: true}, $filter: {defaultValue: 0}}
        });

        schema.validate({}).then((results) => {
          should(results.isValid).eql(false);
          done();
        });
      });
      it('invalid required', function(done) {
        var schema = new Schema({
          house: {$type: Number, $validate: {required: true}, $filter: {defaultValue: undefined}}
        });

        schema.validate({}).then((results) => {
          should(results.isValid).eql(false);
          done();
        });
      });
    });
    it('should inject new ObjectID if field named _id and defined as ObjectID does not have a value', function(done) {
      var data = {} as {_id: ObjectID};

      var schema = new Schema({
        _id: {
          $type: 'ObjectID'
        }
      });

      schema.validate(data).then(() => {
        should(data._id.constructor.name).eql('ObjectID');
        done();
      });
    });
    it('should not inject new ObjectID if field name is something other than _id, defined as ObjectID and does not have a value', function(done) {
      var data = {} as {other: ObjectID};

      var schema = new Schema({
        other: {
          $type: 'ObjectID'
        }
      });

      schema.validate(data).then(() => {
        should(data.other).eql(undefined);
        done();
      }).catch((e) => {
        done(e);
      });
    });
    it('should inject new ObjectID if field defined as ObjectID if default value is "new"', function(done) {
      var data = {} as {other: ObjectID};

      var schema = new Schema({
        other: {
          $type: 'ObjectID',
          $filter: {defaultValue: 'new'}
        }
      });

      schema.validate(data).then(() => {
        should(data.other.constructor.name).eql('ObjectID');
        done();
      }).catch((e) => {
        done(e);
      });
    });
    it('should inject empty object if no default object value is provided', function(done) {
      var data = {} as {user: ObjectID};

      var schema = new Schema({
        user: {
          $type: Object
        }
      });

      schema.validate(data).then(() => {
        should(data.user).be.type('object');
        should(data.user).eql({});
        done();
      });
    });
    it('should inject empty nested object if no default object value is provided', function(done) {
      var data = {} as {user: {address: {}}};

      var schema = new Schema({
        user: {
          address: {}
        }
      });

      schema.validate(data).then(() => {
        should(data.user.address).be.type('object');
        should(data.user.address).eql({});
        done();
      });
    });
    it('should set field with primitive type to undefined if not provided', function(done) {
      var data = {} as {name: string};

      var schema = new Schema({
        name: {$type: String}
      });
      
      schema.validate(data).then(() => {
        should(data.name).be.type('undefined');
        done();
      });
    });
    it('should set field of nested object with primitive type to undefined if not provided', function(done) {
      var data = {} as {user: {name: string}};

      var schema = new Schema({
        user: {
          name: {$type: String}
        }
      });

      schema.validate(data).then(() => {
        should(data.user.name).be.type('undefined');
        done();
      });
    });
    it('should set default value on nested object even if parent object was not provided', function(done) {
      var data = {} as {user: {name: string}};

      var schema = new Schema({
        user: {
          name: {$type: String, $filter: {defaultValue: 'Kevin'}}
        }
      });

      schema.validate(data).then(() => {
        should(data.user.name).be.type('string');
        should(data.user.name).eql('Kevin');
        done();
      });
    });
  });
});
