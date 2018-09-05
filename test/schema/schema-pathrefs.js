var should = require('should');
var Schema = require('../../src/schema');
var Types = require('../../src/schema/types');

describe('Schema', function() {
  describe('applyPathRefs', function() {
    it('should apply $pathref value', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        address: {
          userId: {$pathref: '_id'},
          postcode: 'L1'
        }
      });

      user = schema.applyPathRefs(user);
      should(user.address.userId).eql('123');
    });
    it('should apply $pathref value deep', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        a: {
          b: {
            c:  {
              userId: {$pathref: '_id'}
            }
          }
        }
      });

      user = schema.applyPathRefs(user);
      should(user.a.b.c.userId).eql('123');
    });
  });
  describe('stripTransients', function() {
    it('should should strip $pathref value', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        address: {
          userId: {$pathref: '_id'},
          postcode: 'L1'
        }
      });

      user = schema.applyPathRefs(user);
      should(user.address.userId).eql('123');
      user = schema.stripTransients(user);
      should(user.address.userId).eql(undefined);
    });
    it('should should strip $pathref value deep', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        a: {
          b: {
            c:  {
              userId: {$pathref: '_id'}
            }
          }
        }
      });

      user = schema.applyPathRefs(user);
      should(user.a.b.c.userId).eql('123');
      user = schema.stripTransients(user);
      should(user.a.b.c.userId).eql(undefined);
    });
  });
});
