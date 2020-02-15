import should = require('should');
import Schema from '../../lib/schema';

describe('filtering', function(){
  describe('trim', function(){
    it('should trim string', async () => {
      var data = {name: ' Kevin '};

      var schema = new Schema({
        name: {$type: String, $filter: {trim: true}}
      });

      await schema.validate(data);
      should(data.name).eql('Kevin');
    });
  });
  describe('uppercase', function(){
    it('should convert string to uppercase', async () => {
      var data = {name: 'kevin'};

      var schema = new Schema({
        name: {$type: String, $filter: {uppercase: true}}
      });

      await schema.validate(data);
      should(data.name).eql('KEVIN');
    });
  });
  describe('lowercase', function(){
    it('should convert string to lowercase', async () => {
      var data = {name: 'KEVIN'};

      var schema = new Schema({
        name: {$type: String, $filter: {lowercase: true}}
      });

      await schema.validate(data);
      should(data.name).eql('kevin');
    });
  });
  describe.only('postcode', function(){
    it('should convert string to postcode', async () => {
      var data = {postcode: 'L151HL'};

      var schema = new Schema({
        postcode: {$type: String, $filter: {postcode: true}}
      });

      await schema.validate(data);
      should(data.postcode).eql('L15 1HL');
    });
  });
  describe('defaultValue', function(){
    it('should set default value when field undefined', async () => {
      var data = {name: undefined};

      var schema = new Schema({
        name: {$type: String, $filter: {defaultValue: 'Kevin'}}
      });

      await schema.validate(data);
      should(data.name).eql('Kevin');
    });
  });
  describe('custom', function(){
    it('should filter via provided filter callback', async () => {
      var data = {name: 'Kevin'};

      var schema = new Schema({
        name: {$type: String, $filter: {custom: (value) => {
          return value + ' modified';
        }}}
      });

      await schema.validate(data);
      should(data.name).eql('Kevin modified');
    });
  });
});