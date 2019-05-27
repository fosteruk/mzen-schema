import should = require('should');
import Schema, { SchemaQuery } from '../../lib/schema';


describe('validateQuery', function(){
  it('should cast query parameters', async () => {
    var data = {
      name: {$eq: 123},
      age: {$lt: '33'},
      cityId: {$in: ['10', '11', '12']},
      countryId: {$nin: [13, 14, 15]},
    } as SchemaQuery;

    var schema = new Schema({
      name: String,
      age: Number,
      cityId: Number,
      countryId: String
    });

    await schema.validateQuery(data);

    should(data.name.$eq).eql('123');
    should(data.name.$eq.constructor).eql(String);
    should(data.age.$lt).eql(33);
    should(data.age.$lt.constructor).eql(Number);
    should(data.cityId.$in).eql([10, 11, 12]);
    should(data.cityId.$in[0].constructor).eql(Number);
    should(data.cityId.$in[1].constructor).eql(Number);
    should(data.cityId.$in[2].constructor).eql(Number);
    should(data.countryId.$nin).eql(['13', '14', '15']);
    should(data.countryId.$nin[0].constructor).eql(String);
    should(data.countryId.$nin[1].constructor).eql(String);
    should(data.countryId.$nin[2].constructor).eql(String);
  });
  it('should cast query parameters within conditional $or', async () => {
    var data = {
      '$or': [
        {name: {$eq: 123}},
        {name: {$eq: 456}}
      ]
    } as SchemaQuery;

    var schema = new Schema({
      name: String,
    });

    await schema.validateQuery(data);

    should(data.$or[0].name.$eq).eql('123');
    should(data.$or[0].name.$eq.constructor).eql(String);
    should(data.$or[1].name.$eq).eql('456');
    should(data.$or[1].name.$eq.constructor).eql(String);
  });
  it('should cast query parameters of $in operator', async () => {
    var data = {
      name: {$in: [123, 456, 789]} 
    } as SchemaQuery;

    var schema = new Schema({
      name: String
    });

    await schema.validateQuery(data);

    should(data.name.$in[0]).eql('123');
    should(data.name.$in[0].constructor).eql(String);
    should(data.name.$in[1]).eql('456');
    should(data.name.$in[1].constructor).eql(String);
    should(data.name.$in[2]).eql('789');
    should(data.name.$in[2].constructor).eql(String);
  });
  it('should cast query parameters of $nin operator', async () => {
    var data = {
      name: {$nin: [123, 456, 789]} 
    } as SchemaQuery;

    var schema = new Schema({
      name: String
    });

    await schema.validateQuery(data);

    should(data.name.$nin[0]).eql('123');
    should(data.name.$nin[0].constructor).eql(String);
    should(data.name.$nin[1]).eql('456');
    should(data.name.$nin[1].constructor).eql(String);
    should(data.name.$nin[2]).eql('789');
    should(data.name.$nin[2].constructor).eql(String);
  });
  it('should cast query parameters within conditional $and', async () => {
    var data = {
      '$and': [
        {name: {$eq: 123}},
        {age: {$eq: '35'}}
      ]
    } as SchemaQuery;

    var schema = new Schema({
      name: String,
      age: Number
    });

    await schema.validateQuery(data);

    should(data.$and[0].name.$eq).eql('123');
    should(data.$and[0].name.$eq.constructor).eql(String);
    should(data.$and[1].age.$eq).eql(35);
    should(data.$and[1].age.$eq.constructor).eql(Number);
  });
  it('should cast query parameters within nested conditionals', async () => {
    var data = {
      '$or': [
        {
          '$and': [
            {name: {$eq: 123}},
            {age: {$eq: '35'}}
          ]
        },
        {
          '$and': [
            {name: {$in: [456]}},
            {age: {$nin: ['37']}}
          ]
        },
      ]
    } as SchemaQuery;

    var schema = new Schema({
      name: String,
      age: Number
    });

    await schema.validateQuery(data);

    should(data.$or[0].$and[0].name.$eq).eql('123');
    should(data.$or[0].$and[0].name.$eq.constructor).eql(String);
    should(data.$or[0].$and[1].age.$eq).eql(35);
    should(data.$or[0].$and[1].age.$eq.constructor).eql(Number);
    should(data.$or[1].$and[0].name.$in[0]).eql('456');
    should(data.$or[1].$and[0].name.$in[0].constructor).eql(String);
    should(data.$or[1].$and[1].age.$nin[0]).eql(37);
    should(data.$or[1].$and[1].age.$nin[0].constructor).eql(Number);
  });
});
