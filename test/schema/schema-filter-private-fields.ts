import should = require('should');
import Schema from '../../lib/schema';

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
  describe('filterPrivateValue', function () {
    it('filter private params', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {privateValue: true}},
      });

      schema.filterPrivate(data);

      should(data).eql({name: true, age: 35});
    });
    it('filter private params with mode write', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {privateValue: 'write'}},
      });

      schema.filterPrivate(data, 'write');

      should(data).eql({name: true, age: 35});
    });
    it('filter private params with mode read', function () {
      var data = {
        name: 123,
        age: 35
      };

      var schema = new Schema({
        name: {$type: String, $filter: {privateValue: 'read'}},
      });

      schema.filterPrivate(data, 'read');

      should(data).eql({name: true, age: 35});
    });
  });
});
