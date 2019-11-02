import clone = require('clone');
import should = require('should');
import { Collection } from '../lib/collection';

class People extends Collection {}

const data = {
  people: [
    {name: 'Kevin', age: 37, nationality: 'British', address: {postcode: 'L15'}},
    {name: 'Fudge', age: 8, nationality: 'British', address: {postcode: 'L15'}},
    {name: 'Kar Chun', age: 37, nationality: 'Malaysian', address: {postcode: '87MF'}},
    {name: 'Alison', age: 37, nationality: 'British', address: {postcode: 'L1'}},
  ],
};

describe.only('Collection', function(){
  describe('findAll()', function(){
    it('should return array of objects matching query', function(){
      const people = new Collection(...data.people);
      const result = people.findAll({nationality: 'British'});
      should(result.length).eql(3);
      should(result[0].name).eql('Kevin');
      should(result[1].name).eql('Fudge');
      should(result[2].name).eql('Alison');
    });
    it('should return array of objects matching query using dotted paths', function(){
      const people = new Collection(...data.people);
      const result = people.findAll({'address.postcode': 'L15'});
      should(result.length).eql(2);
      should(result[0].name).eql('Kevin');
      should(result[1].name).eql('Fudge');
    });
    it('should return an empty array if nothing found', function(){
      const people = new Collection();
      const result = people.findAll({nationality: 'Other'});
      should(result.length).eql(0);
    });
    it('should return collection of same type', function(){
      const people = new People(...data.people);
      const result = people.findAll({nationality: 'British'});
      should(people.constructor).eql(People);
      should(people.constructor.name).eql('People');
      should(result.length).eql(3);
    });
  });
  describe('findOne()', function(){
    it('should return first element matching query', function(){
      const people = new Collection(...data.people);
      const result = people.findOne({nationality: 'British'});
      should(result.name).eql('Kevin');
    });
    it('should return first element matching query using dotted paths', function(){
      const people = new Collection(...data.people);
      const result = people.findOne({'address.postcode': 'L15'});
      should(result.name).eql('Kevin');
    });
    it('should return undefined nothing found', function(){
      const people = new Collection();
      const result = people.findOne({nationality: 'Other'});
      should(result).eql(undefined);
    });
  });
  describe('update()', function(){
    describe('$set', function(){
      it('should $set on objects targeted by find query', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({name: 'Kevin'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].age).eql(37);
        people.update({name: 'Kevin'}, {
          $set:{age: 38}
        });
        should(findResultA[0].age).eql(38);
      });
      it('should $set on objects targeted by find query using dotted path', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({'address.postcode': 'L15'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].age).eql(37);
        should(findResultA[1].name).eql('Fudge');
        should(findResultA[1].age).eql(8);
        people.update({'address.postcode': 'L15'}, {
          $set:{age: 5}
        });
        should(findResultA[0].age).eql(5);
        should(findResultA[1].age).eql(5);
      });
      it('should $set on objects dotted path targeted by find query', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({name: 'Kevin'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].address.postcode).eql('L15');
        people.update({name: 'Kevin'}, {
          $set:{'address.postcode': 'L15 1HL'}
        });
        should(findResultA[0].address.postcode).eql('L15 1HL');
      });
    });
    describe('$unset', function(){
      it('should $unset on objects targeted by find query', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({name: 'Kevin'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].age).eql(37);
        people.update({name: 'Kevin'}, {
          $unset:{age: true}
        });
        should(findResultA[0].age).eql(undefined);
      });
      it('should $unset on objects targeted by find query using dotted path', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({'address.postcode': 'L15'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].age).eql(37);
        should(findResultA[1].name).eql('Fudge');
        should(findResultA[1].age).eql(8);
        people.update({'address.postcode': 'L15'}, {
          $unset:{age: true}
        });
        should(findResultA[0].age).eql(undefined);
        should(findResultA[1].age).eql(undefined);
      });
      it('should $unset on objects dotted path targeted by find query', function(){
        const people = new Collection(...clone(data.people));
        const findResultA = people.findAll({name: 'Kevin'});
        should(findResultA[0].name).eql('Kevin');
        should(findResultA[0].address.postcode).eql('L15');
        people.update({name: 'Kevin'}, {
          $unset:{'address.postcode': true}
        });
        should(findResultA[0].address.postcode).eql(undefined);
      });
    });
  });
});
