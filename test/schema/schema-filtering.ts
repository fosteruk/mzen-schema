import should = require('should');
import Schema from '../../lib/schema';

describe('Schema', function() {
  describe('filtering', function() {
    describe('trim', function() {
      it('should trim string', function(done) {
        var data = {name: ' Kevin '};

        var schema = new Schema({
          name: {$type: String, $filter: {trim: true}}
        });

        schema.validate(data).then(() => {
          should(data.name).eql('Kevin');
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('uppercase', function() {
      it('should convert string to uppercase', function(done) {
        var data = {name: 'kevin'};

        var schema = new Schema({
          name: {$type: String, $filter: {uppercase: true}}
        });

        schema.validate(data).then(() => {
          should(data.name).eql('KEVIN');
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('lowercase', function() {
      it('should convert string to lowercase', function(done) {
        var data = {name: 'KEVIN'};

        var schema = new Schema({
          name: {$type: String, $filter: {lowercase: true}}
        });

        schema.validate(data).then(() => {
          should(data.name).eql('kevin');
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('defaultValue', function() {
      it('should set default value when field undefined', function(done) {
        var data = {name: undefined};

        var schema = new Schema({
          name: {$type: String, $filter: {defaultValue: 'Kevin'}}
        });

        schema.validate(data).then(() => {
          should(data.name).eql('Kevin');
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
    describe('custom', function() {
      it('should filter via provided filter callback', function(done) {
        var data = {name: 'Kevin'};

        var schema = new Schema({
          name: {$type: String, $filter: {custom: (value) => {
            return value + ' modified';
          }}}
        });

        schema.validate(data).then(() => {
          should(data.name).eql('Kevin modified');
          done();
        }).catch((error) => {
          done(error);
        });
      });
    });
  });
});
