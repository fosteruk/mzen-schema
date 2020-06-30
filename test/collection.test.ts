import clone = require('clone');
import should = require('should');
import { Collection } from '../lib/collection';
import ObjectId from 'bson-objectid';

class People extends Collection<any> {}

const data = {
  people: [
    {_id: new ObjectId('5932fce4aa1fe86c751fce30'), name: 'Kevin', age: 37, nationality: 'British', address: {postcode: 'L15'}},
    {_id: new ObjectId('5932fce4aa1fe86c751fce31'), name: 'Fudge', age: 8, nationality: 'British', address: {postcode: 'L15'}},
    {_id: new ObjectId('5932fce4aa1fe86c751fce32'), name: 'Kar Chun', age: 37, nationality: 'Malaysian', address: {postcode: '87MF'}},
    {_id: new ObjectId('5932fce4aa1fe86c751fce33'), name: 'Alison', age: 37, nationality: 'British', address: {postcode: 'L1'}},
  ],
};

describe('Collection', function(){
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
    it('should return array of objects matching bson object id string', function(){
      const people = new People(...data.people);

      const resultFail = people.findAll({
        _id: new ObjectId('5932fce4aa1fe86c751fce30')
      });
      should(resultFail.length).eql(0);

      const resultA = people.findAll({
        _id: String(new ObjectId('5932fce4aa1fe86c751fce30'))
      });
      should(resultA.length).eql(1);
      should(resultA[0].name).eql('Kevin');

      const resultB = people.findAll({_id: '5932fce4aa1fe86c751fce30'});
      should(resultB.length).eql(1);
      should(resultB[0].name).eql('Kevin');
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
    it('should return object matching bson object id string', function(){
      const people = new People(...data.people);

      const resultFail = people.findOne({
        _id: new ObjectId('5932fce4aa1fe86c751fce30')
      });
      should(resultFail).eql(undefined);

      const resultA = people.findOne({
        _id: String(new ObjectId('5932fce4aa1fe86c751fce30'))
      });
      should(resultA.name).eql('Kevin');

      const resultB = people.findOne({_id: '5932fce4aa1fe86c751fce30'});
      should(resultB.name).eql('Kevin');
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
  describe('delete()', function(){
    it('should delete items', function(){
      const people = new Collection(...clone(data.people));
      should(people.length).eql(4);
      people.delete({name: 'Kevin'});
      should(people.length).eql(3);
      const kevins = people.findAll({name: 'Kevin'});
      should(kevins.length).eql(0);
    });
    it('should delete items using dotted path', function(){
      const people = new Collection(...clone(data.people));
      should(people.length).eql(4);
      people.delete({'address.postcode': 'L1'});
      should(people.length).eql(3);
      const l1s = people.findAll({'address.postcode': 'L1'});
      should(l1s.length).eql(0);
    });
  });
  describe('replace()', function(){
    it('should replace matched items with given value', function(){
      const people = new Collection(...clone(data.people));
      people.replace({name: 'Kevin'}, {
        name: 'Tom',
        nationality: 'German', 
        address: {postcode: 'ABC'}
      });
      const kevins = people.findAll({name: 'Kevin'});
      should(kevins.length).eql(0);
      const toms = people.findAll({name: 'Tom'});
      should(toms.length).eql(1);
      should(toms[0].address.postcode).eql('ABC');
    });
    it('should replace matched items using replacer function', function(){
      const people = new Collection(...clone(data.people));
      people.replace({name: 'Kevin'}, oldValue => {
        oldValue.name = oldValue.name + ' Updated';
        return oldValue;
      });
      const kevins = people.findAll({name: 'Kevin'});
      should(kevins.length).eql(0);
      const toms = people.findAll({name: 'Kevin Updated'});
      should(toms.length).eql(1);
    });
  });
  describe('findIndex()', function() {
    it('should return index of object element matching find query', function() {
      const people = new Collection(...data.people);
      should(people.findOneIndex({name: 'Kevin'})).eql(0);
      should(people.findOneIndex({name: 'Fudge'})).eql(1);
    });
  });
  describe('moveUp()', function() {
    it('should move element up', function() {
      const people = new Collection(...data.people);

      should(people[0].name).eql('Kevin');
      should(people[1].name).eql('Fudge');
      should(people[2].name).eql('Kar Chun');
      should(people[3].name).eql('Alison');

      people.moveUp(3);
      should(people[0].name).eql('Kevin');
      should(people[1].name).eql('Fudge');
      should(people[2].name).eql('Alison');
      should(people[3].name).eql('Kar Chun');

      people.moveUp(2);
      should(people[0].name).eql('Kevin');
      should(people[1].name).eql('Alison');
      should(people[2].name).eql('Fudge');
      should(people[3].name).eql('Kar Chun');

      people.moveUp(1);
      should(people[0].name).eql('Alison');
      should(people[1].name).eql('Kevin');
      should(people[2].name).eql('Fudge');
      should(people[3].name).eql('Kar Chun');
    });
  });
  describe('moveDown()', function() {
    it('should move element down', function() {
      const people = new Collection(...data.people);

      should(people[0].name).eql('Kevin');
      should(people[1].name).eql('Fudge');
      should(people[2].name).eql('Kar Chun');
      should(people[3].name).eql('Alison');

      people.moveDown(0);
      should(people[0].name).eql('Fudge');
      should(people[1].name).eql('Kevin');
      should(people[2].name).eql('Kar Chun');
      should(people[3].name).eql('Alison');

      people.moveDown(1);
      should(people[0].name).eql('Fudge');
      should(people[1].name).eql('Kar Chun');
      should(people[2].name).eql('Kevin');
      should(people[3].name).eql('Alison');

      people.moveDown(2);
      should(people[0].name).eql('Fudge');
      should(people[1].name).eql('Kar Chun');
      should(people[2].name).eql('Alison');
      should(people[3].name).eql('Kevin');
    });
  });
});
