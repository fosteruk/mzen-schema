var should = require('should');
var Schema = require('../../lib/schema');

describe('Schema', function () {
  describe('filterPrivate', function () {
    it('filter private params', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {private: true}},
      });

      schema.filterPrivate(data);

      should(data).eql({age: 35});
    });
    it('filter private params with mode write', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {private: 'write'}},
      });

      schema.filterPrivate(data, 'write');

      should(data).eql({age: 35});
    });
    it('filter private params with mode read', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {private: 'read'}},
      });

      schema.filterPrivate(data, 'read');

      should(data).eql({age: 35});
    });
  });
});
