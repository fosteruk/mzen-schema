import should = require('should');
import Schema from '../lib/schema';
import SchemaMapper from '../lib/mapper';

describe('SchemaMapper', function(){
  describe('map', function(){
    it('should callback with field spec', function(){
      var spec = {name: String, $strict: true};
      var schemaIterator = new SchemaMapper(spec);

      var results = [];
      schemaIterator.map({name: 'Kevin'}, function(fieldSpec){
        results.push({fieldSpec});
      });
      should(results[0].fieldSpec).eql(spec);
      should(results[1].fieldSpec).eql(spec.name);
    });
    it('should callback with field name', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);

      var results = [];
      // @ts-ignore - unused fieldSpec
      schemaIterator.map({name: 'Kevin'}, function(fieldSpec, fieldName){
        results.push({fieldName});
      });

      should(results[0].fieldName).eql('root');
      should(results[1].fieldName).eql('name');
    });
    it('should callback with field index of array value', function(){
      var spec = {names: [String]};
      var schemaIterator = new SchemaMapper(spec);

      var results = [];
      // @ts-ignore - unused fieldSpec
      schemaIterator.map({names: ['Kevin']}, function(fieldSpec, fieldName){
        results.push({fieldName});
      });

      should(results[0].fieldName).eql('root');
      should(results[1].fieldName).eql('names');
      should(results[2].fieldName).eql(0);
    });
    it('should callback with field container object', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);
      var value = [{name: 'Kevin'}];

      var results = [];
      // @ts-ignore - unused fieldSpec and fieldName
      schemaIterator.map(value, function(fieldSpec, fieldName, fieldContainer){
        results.push({fieldContainer});
      });

      should(results[1].fieldContainer).eql(value);
      should(results[2].fieldContainer).eql(value[0]);
    });
    it('should callback with field container array', function(){
      var spec = {names: [String]};
      var schemaIterator = new SchemaMapper(spec);
      var value = [{names: ['Kevin']}];

      var results = [];
      // @ts-ignore - unused fieldSpec and fieldName
      schemaIterator.map(value, function(fieldSpec, fieldName, fieldContainer){
        results.push({fieldContainer});
      });

      should(results[1].fieldContainer).eql(value);
      should(results[2].fieldContainer).eql(value[0]);
      should(results[3].fieldContainer).eql(value[0].names);
    });
    it('should callback with field path', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);

      var results = [];
      // @ts-ignore - unused fieldSpec and fieldName and fieldContainer
      schemaIterator.map({name: 'Kevin'}, function(fieldSpec, fieldName, fieldContainer, path){
        results.push({path});
      });

      should(results[0].path).eql('');
      should(results[1].path).eql('name');
    });
    it('should callback with field path of nested array', function(){
      var spec = {};
      var schemaIterator = new SchemaMapper(spec);

      var data = [
        {
          name: 'A0',
          children: [
            {name: 'A1'},
            {name: 'B1'},
            {name: 'C1'},
          ]
        },
        {name: 'B0'},
        {name: 'C0'},
      ];

      var results = [];
      // @ts-ignore - unused fieldSpec and fieldName and fieldContainer
      schemaIterator.map(data, function(fieldSpec, fieldName, fieldContainer, path){
        results.push({path});
      });

      should(results[0].path).eql('');
      should(results[1].path).eql('0');
      should(results[2].path).eql('0.name');
      should(results[3].path).eql('0.children');
      should(results[4].path).eql('1');
      should(results[5].path).eql('1.name');
      should(results[6].path).eql('2');
      should(results[7].path).eql('2.name');
    });
  });
  it('should callback with field spec from embedded schema reference', function(){
    var specAddress = {
      $name: 'address',  // this defines hte schema name
      $strict: true,
      buildingNumber: Number,
      street: String,
      city: String,
      country: String
    };
    var specUser = {
      $name: 'user',  // this defines hte schema name
      name: String,
      address: {$schema: 'address'}
    };

    var schemaIterator = new SchemaMapper(specUser, {
      schemas: [new Schema(specAddress)]
    });

    var results = [];
    schemaIterator.map({name: 'Kevin'}, function(fieldSpec){
      results.push({fieldSpec});
    });

    should(results[0].fieldSpec.address).eql(specAddress);
  });
  describe('mapPaths', function(){
    it('should callback with field spec', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);
      schemaIterator.mapPaths({'name': 'Kevin'}, function(fieldSpec){
        should(fieldSpec).eql(String);
      });
    });
    it('should callback with field name', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);
      // @ts-ignore - unused fieldSpec
      schemaIterator.mapPaths({'name': 'Kevin'}, function(fieldSpec, fieldName){
        should(fieldName).eql('name');
      });
    });
    it('should callback with field index of array value', function(){
      var spec = {names: [String]};
      var schemaIterator = new SchemaMapper(spec);

      var results = [];
      // @ts-ignore - unused fieldSpec
      schemaIterator.mapPaths({'names': ['Kevin']}, function(fieldSpec, fieldName){
        results.push({fieldName});
      });
      should(results[0].fieldName).eql('names');
      should(results[1].fieldName).eql(0);
    });
    it('should callback with field container object', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);
      var object = {name: 'Kevin'};
      // @ts-ignore - unused fieldSpec and fieldName
      schemaIterator.mapPaths({name: 'Kevin'}, function(fieldSpec, fieldName, fieldContainer){
        should(fieldContainer).eql(object);
      });
    });
    it('should callback with field container array', function(){
      var spec = {names: [String]};
      var schemaIterator = new SchemaMapper(spec);
      var value = {names: ['Kevin']};

      var results = [];
      // @ts-ignore - unused fieldSpec and fieldName
      schemaIterator.mapPaths({names: ['Kevin']}, function(fieldSpec, fieldName, fieldContainer){
        results.push({fieldContainer});
      });
      should(results[0].fieldContainer).eql(value);
      should(results[1].fieldContainer).eql(value.names);
    });
    it('should callback with field path', function(){
      var spec = {name: String};
      var schemaIterator = new SchemaMapper(spec);
      // @ts-ignore - unused fieldSpec and fieldName and fieldContainer
      schemaIterator.mapPaths({name: 'Kevin'}, function(fieldSpec, fieldName, fieldContainer, path){
        should(path).eql('name');
      });
    });
  });
});
