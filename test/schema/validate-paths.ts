import should = require('should');
import Schema from '../../lib/schema';

describe('validatePaths', function(){
  it('should process field name', async () => {
    var paths = {age: '35'};
    
    var schema = new Schema({
      age: Number
    });

    await schema.validatePaths(paths);

    should(paths.age).eql(35);
    should(paths.age.constructor).eql(Number);
  });
  it('should process field path', async () => {
    var paths = {'name.first': 12345};
    
    var schema = new Schema({
      name: {first: String}
    });

    await schema.validatePaths(paths);

    should(paths['name.first']).eql('12345');
    should(paths['name.first'].constructor).eql(String);
  });
  it('should process field path array element', async () => {
    var paths = {
      'names.0.first': 1234
    };
    
    var schema = new Schema({
      names: [{first: String}]
    });

    await schema.validatePaths(paths);

    should(paths['names.0.first']).eql('1234');
    should(paths['names.0.first'].constructor).eql(String);
  });
  it('should process field path array', async () => {
    var paths = {
      'names.*.first': 1234
    };
    
    var schema = new Schema({
      names: [{first: String}]
    });

    await schema.validatePaths(paths);

    should(paths['names.*.first']).eql('1234');
    should(paths['names.*.first'].constructor).eql(String);
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
    const resultFail = await schema.validatePaths({
      user: {
        name: 'Kevin',
        address: null // missing required "street"
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

    const result = await schema.validatePaths(data);
    should(result.isValid).eql(true);
    should(data.user.address).eql(null);
  });
  it('should skip validation for null $nullable within array', async () => {
    var schema = new Schema({
      user: {
        name: String,
        business: {
          $type: Array,
          $spec: {
            businessId: {$type: String},
            invite: {
              userId: {$type: String, $validate: {required: true}}
            }
          }
        }
      }
    });
    const resultFail = await schema.validatePaths({
      user: {
        name: 'Kevin',
        business: [
          {
            businessId: '1',
            invite: null // missing "userId" - not nullable
          }
        ]
      }
    });
    should(resultFail.isValid).eql(false);

    var data = {
      user: {
        name: 'Kevin',
        business: [
          {
            businessId: '1',
            invite: null
          }
        ]
      }
    };

    var schema = new Schema({
      user: {
        name: String,
        business: {
          $type: Array,
          $spec: {
            businessId: {$type: String},
            invite: {
              $nullable: true,
              userId: {$type: String, $validate: {required: true}},
              created: {$type: Date, $validate: {required: true}}
            }
          }
        }
      }
    });

    const result = await schema.validatePaths(data);
    should(result.isValid).eql(true);
    should(data.user.business[0].invite).eql(null);
  });
});

