import should = require('should');
import Schema from '../../../lib/schema';

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
});

