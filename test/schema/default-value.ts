import should = require('should');
import Schema from '../../lib/schema';
import ObjectID from 'bson-objectid';

describe('default value', function(){
  it('should inject default value when undefined', async () => {
    var data: {house?: number} = {};

    var schema = new Schema({
      house: {$type: Number, $filter: {defaultValue: 5}}
    });

    await schema.validate(data);
    should(data.house).eql(5);
  });
  it('should inject default function value when undefined', async () => {
    var data: {created?: Date} = {};

    var schema = new Schema({
      created: {$type: Date, $filter: {defaultValue: () => new Date}}
    });

    await schema.validate(data);
    should(data.created.constructor.name).eql('Date');
  });
  it('should inject default value when undefined using $spec', async () => {
    var data: {house?: number} = {};

    var schema = new Schema({
      $type: Object,
      $spec: {
        house: {$type: Number, $filter: {defaultValue: 5}}
      }
    });

    await schema.validate(data);
    should(data.house).eql(5);
  });
  it('should typecast default string to date', async () => {
    var data: {created?: Date} = {};

    var schema = new Schema({
      created: {$type: Date, $filter: {defaultValue: 'now'}}
    });

    await schema.validate(data);
    should(data.created.constructor.name).eql('Date');
  });
  it('should inject default value when null', async () => {
    var data: {house?: number} = {};

    var schema = new Schema({
      house: {$type: Number, $filter: {defaultValue: 5}}
    });

    await schema.validate(data);
    should(data.house).eql(5);
  });
  it('should inject default value when null, even when defined as not null', async () => {
    var data: {house?: number} = {};

    var schema = new Schema({
      house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: 5}}
    });

    await schema.validate(data);
    should(data.house).eql(5);
  });
  describe('should validate injected default value', function(){
    it('valid not null', async () => {
      var schema = new Schema({
        house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: 5}}
      });

      const result = await schema.validate({});
      should(result.isValid).eql(true);
    });
    it('invalid not null', async () => {
      var schema = new Schema({
        house: {$type: Number, $validate: {notNull: true}, $filter: {defaultValue: null}}
      });

      const result = await schema.validate({});
      should(result.isValid).eql(false);
    });
    it('invalid not empty', async () => {
      var schema = new Schema({
        house: {$type: Number, $validate: {notEmpty: true}, $filter: {defaultValue: 0}}
      });

      const result = await schema.validate({});
      should(result.isValid).eql(false);
    });
    it('invalid required', async () => {
      var schema = new Schema({
        house: {$type: Number, $validate: {required: true}, $filter: {defaultValue: undefined}}
      });

      const result = await schema.validate({});
      should(result.isValid).eql(false);
    });
  });
  it('should inject new ObjectID if field named _id and defined as ObjectID does not have a value', async () => {
    var data: {_id?: ObjectID} = {};

    var schema = new Schema({
      _id: {
        $type: 'ObjectID'
      }
    });

    await schema.validate(data);
    should(data._id.constructor.name).eql('ObjectID');
  });
  it('should not inject new ObjectID if field name is something other than _id, defined as ObjectID and does not have a value', async () => {
    var data: {other?: ObjectID} = {};

    var schema = new Schema({
      other: {
        $type: 'ObjectID'
      }
    });

    await schema.validate(data);
    should(data.other).eql(undefined);
  });
  it('should inject new ObjectID if field defined as ObjectID if default value is "new"', async () => {
    var data: {other?: ObjectID} = {};

    var schema = new Schema({
      other: {
        $type: 'ObjectID',
        $filter: {defaultValue: 'new'}
      }
    });

    await schema.validate(data);
    should(data.other.constructor.name).eql('ObjectID');
  });
  it('should inject empty object if no default object value is provided', async () => {
    var data: {user?: ObjectID} = {};

    var schema = new Schema({
      user: {
        $type: Object
      }
    });

    await schema.validate(data);
    should(data.user).be.type('object');
    should(data.user).eql({});
  });
  it('should inject empty nested object if no default object value is provided', async () => {
    var data: {user?: {address: {}}} = {};

    var schema = new Schema({
      user: {
        address: {}
      }
    });

    await schema.validate(data)
    should(data.user.address).be.type('object');
    should(data.user.address).eql({});
  });
  it('should inject null for an object via $nullable flag', async () => {
    var data: {user?: {address?: {street?: string}}} = {};

    var schema = new Schema({
      user: {
        address: {
          $nullable: true,
          street: {$validate: {required: true}}
        }
      }
    });

    await schema.validate(data)
    should(data.user.address).eql(null);
  });
  it('should set field with primitive type to undefined if not provided', async () => {
    var data: {name?: string} = {};

    var schema = new Schema({
      name: {$type: String}
    });
    
    await schema.validate(data);
    should(data.name).be.type('undefined');
  });
  it('should set field of nested object with primitive type to undefined if not provided', async () => {
    var data:  {user?: {name: string}} = {};

    var schema = new Schema({
      user: {
        name: {$type: String}
      }
    });

    await schema.validate(data);
    should(data.user.name).be.type('undefined');
  });
  it('should set default value on nested object even if parent object was not provided', async () => {
    var data: {user?: {name: string}} = {};

    var schema = new Schema({
      user: {
        name: {$type: String, $filter: {defaultValue: 'Kevin'}}
      }
    });

    await schema.validate(data);
    should(data.user.name).be.type('string');
    should(data.user.name).eql('Kevin');
  });
});
