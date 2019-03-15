import should = require('should');
import Schema from '../../lib/schema';

describe('Schema', function() {
  describe('validatePaths', function() {
    it('should process field name', function(done) {
      var paths = {age: '35'};
      
      var schema = new Schema({
        age: Number
      });

      schema.validatePaths(paths).then(() => {
        should(paths.age).eql(35);
        should(paths.age.constructor).eql(Number);
        done();
      });
    });
    it('should process field path', function(done) {
      var paths = {'name.first': 12345};
      
      var schema = new Schema({
        name: {first: String}
      });

      schema.validatePaths(paths).then(() => {
        should(paths['name.first']).eql('12345');
        should(paths['name.first'].constructor).eql(String);
        done();
      });
    });
    it('should process field path array element', function(done) {
      var paths = {
        'names.0.first': 1234
      };
      
      var schema = new Schema({
        names: [{first: String}]
      });

      schema.validatePaths(paths).then(() => {
        should(paths['names.0.first']).eql('1234');
        should(paths['names.0.first'].constructor).eql(String);
        done();
      });
    });
    it('should process field path array', function(done) {
      var paths = {
        'names.*.first': 1234
      };
      
      var schema = new Schema({
        names: [{first: String}]
      });

      schema.validatePaths(paths).then(() => {
        should(paths['names.*.first']).eql('1234');
        should(paths['names.*.first'].constructor).eql(String);
        done();
      });
    });
  });
});
