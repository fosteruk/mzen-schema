import should = require('should');
import { Collection} from '../lib/collection';

const data = {
  people: [
    {name: 'Kevin', age: 37, nationality: 'British', address: {postcode: 'L15'}},
    {name: 'Fudge', age: 37, nationality: 'British', address: {postcode: 'L15'}},
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
});
