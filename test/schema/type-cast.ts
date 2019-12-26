import should = require('should');
import Schema from '../../lib/schema';
import SchemaTypes from '../../lib/types';

describe('type cast', function(){
  it('should cast String to Number', async () => {
    var data = {age: '33', pi: '3.14159265359'};

    var schema = new Schema({
      age: Number,
      pi: Number
    });

    await schema.validate(data);
    should(data.age).eql(33);
    should(data.pi).eql(3.14159265359);
  });
  it('should cast Boolean to Number', async () => {
    var data = {
      isVegetarian: false,
      isNotVegetarian: true
    };

    var schema = new Schema({
      isVegetarian: Number,
      isNotVegetarian: Number
    });

    await schema.validate(data);
    should(data.isVegetarian).eql(0);
    should(data.isNotVegetarian).eql(1);
  });
  it('should cast Number to String', async () => {
    var data = {
      likesCats: 1,
      likesCatsMoreThanDogs: 0,
      likesCakes: 1279,
      doesNotLikeCakes: -1235
    };

    var schema = new Schema({
      likesCats: String,
      likesCatsMoreThanDogs: String,
      likesCakes: String,
      doesNotLikeCakes: String,
    });

    await schema.validate(data);
    should(data.likesCats).eql('1');
    should(data.likesCatsMoreThanDogs).eql('0');
    should(data.likesCakes).eql('1279');
    should(data.doesNotLikeCakes).eql('-1235');
  });
  it('should cast Boolean to String', async () => {
    var data = {
      isVegetarian: false,
      isNotVegetarian: true
    };

    var schema = new Schema({
      isVegetarian: String,
      isNotVegetarian: String
    });

    await schema.validate(data);
    should(data.isVegetarian).eql('0');
    should(data.isNotVegetarian).eql('1');
  });
  it('should cast ObjectId to String', async () => {
    var data = {
      _id: new SchemaTypes.ObjectID('5832969760e396039ced6082')
    };

    var schema = new Schema({
      _id: String
    });

    await schema.validate(data);
    should(data._id.constructor).eql(String);
    should(data._id).eql('5832969760e396039ced6082');
  });
  it('should cast String to Boolean', async () => {
    var data = {
      isVegetarian: 'false',
      isNotVegetarian: 'true',
      likesDogs: '1',
      likesDogsMoreThanCats: '0'
    };

    var schema = new Schema({
      isVegetarian: Boolean,
      isNotVegetarian: Boolean,
      likesDogs: Boolean,
      likesDogsMoreThanCats: Boolean
    });
    
    await schema.validate(data);
    should(data.isVegetarian).eql(false);
    should(data.isNotVegetarian).eql(true);
    should(data.likesDogs).eql(true);
    should(data.likesDogsMoreThanCats).eql(false);
  });
  it('should cast Number to Boolean', async () => {
    var data = {
      likesCats: 1,
      likesCatsMoreThanDogs: 0,
      likesCakes: 1279,
      doesNotLikeCakes: -1235
    };

    var schema = new Schema({
      likesCats: Boolean,
      likesCatsMoreThanDogs: Boolean,
      likesCakes: Boolean,
      doesNotLikeCakes: Boolean,
    });

    await schema.validate(data);
    should(data.likesCats).eql(true);
    should(data.likesCatsMoreThanDogs).eql(false);
    should(data.likesCakes).eql(true);
    should(data.doesNotLikeCakes).eql(false);
  });
  it('should cast String to Date', async () => {
    var data = {
      created: '2016-11-19T06:50:08.284Z',
      updated: 'Sat, 19 Nov 2016 06:50:33 GMT'
    };

    var schema = new Schema({
      created: Date,
      updated: Date
    });

    await schema.validate(data);
    should(data.created.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'string'
    should(data.created.toJSON()).eql('2016-11-19T06:50:08.284Z');
    should(data.updated.constructor).eql(Date);
    // @ts-ignore - 'toUTCString' does not exist on type 'string'
    should(data.updated.toUTCString()).eql('Sat, 19 Nov 2016 06:50:33 GMT');
  });
  it('should cast empty String to Date at current time', async () => {
    var data = {
      created: ''
    };

    var schema = new Schema({
      created: Date
    });

    await schema.validate(data);
    var dateForComparison = new Date();
    // Set the time just before now for comparision
    dateForComparison.setSeconds(dateForComparison.getSeconds() - 1);
    should(data.created.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'string'
    should(data.created.getTime()).be.above(dateForComparison.getTime());
  });
  it('should cast String "now" to Date at current time', async () => {
    var data = {
      created: 'now',
      updated: 'NOW',
    };

    var schema = new Schema({
      created: Date,
      updated: Date
    });

    await schema.validate(data);
    var dateForComparison = new Date();
    // Set the time just before now for comparision
    dateForComparison.setSeconds(dateForComparison.getSeconds() - 1);
    
    should(data.created.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'string'
    should(data.created.getTime()).be.above(dateForComparison.getTime());
    should(data.updated.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'string'
    should(data.updated.getTime()).be.above(dateForComparison.getTime());
  });
  it('should cast Number to Date', async () => {
    // A date represented as a number is the number of milliseconds since 1 January 1970 00:00:00 UTC, with leap seconds ignored
    // (Unix Epoch; but consider that most Unix time stamp functions count in seconds)  
    var data = {
      created: 1479538208284,
      updated: 1479538233000
    };

    var schema = new Schema({
      created: Date,
      updated: Date
    });

    await schema.validate(data);
    should(data.created.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'number'
    should(data.created.toJSON()).eql('2016-11-19T06:50:08.284Z');
    should(data.updated.constructor).eql(Date);
    // @ts-ignore - 'getTime' does not exist on type 'number'
    should(data.updated.toUTCString()).eql('Sat, 19 Nov 2016 06:50:33 GMT');
  });
  it('should cast String to ObjectID', async () => {
    var data = {
      _id: '5832969760e396039ced6082'
    };

    var schema = new Schema({
      _id: SchemaTypes.ObjectID
    });

    await schema.validate(data);
    should(data._id.constructor).eql(SchemaTypes.ObjectID);
    should(data._id.toString()).eql('5832969760e396039ced6082');
  });
  it('should cast type specified with String value', async () => {
    var data = {
      _id: '5832969760e396039ced6082',
      name: 123,
      count: '456',
      countArray: ['56', '345', '234'],
      deleted: '0',
      created: 1479717244995, // 2016-11-21T08:34:04.995Z,
      _idB: '5832969760e396039ced6082',
      nameB: 123,
      countB: '456',
      countBArray: ['56', '345', '234'],
      deletedB: '0',
      createdB: 1479717244995 // 2016-11-21T08:34:04.995Z
    };

    var schema = new Schema({
      _id: 'ObjectID',
      name: 'String',
      count: 'Number',
      countArray: ['Number'],
      deleted: 'Boolean',
      created: 'Date',
      _idB: {$type: 'ObjectID'},
      nameB: {$type: 'String'},
      countB: {$type: 'Number'},
      countBArray: [{$type: 'Number'}],
      deletedB: {$type: 'Boolean'},
      createdB: {$type: 'Date'}
    });

    await schema.validate(data);
  
    should(data._id.constructor).eql(SchemaTypes.ObjectID);
    should(data._id.toString()).eql('5832969760e396039ced6082');
    should(data.name.constructor).eql(String);
    should(data.name).eql('123');
    should(data.count.constructor).eql(Number);
    should(data.count).eql(456);
    should(data.countArray[0].constructor).eql(Number);
    should(data.countArray).eql([56, 345, 234]);
    should(data.deleted.constructor).eql(Boolean);
    should(data.deleted).eql(false);
    should(data.created.constructor).eql(Date);
    // @ts-ignore - 'toJSON' does not exist on type 'number'
    should(data.created.toJSON()).eql('2016-11-21T08:34:04.995Z');
    
    should(data._idB.constructor).eql(SchemaTypes.ObjectID);
    should(data._idB.toString()).eql('5832969760e396039ced6082');
    should(data.nameB.constructor).eql(String);
    should(data.nameB).eql('123');
    should(data.countB.constructor).eql(Number);
    should(data.countB).eql(456);
    should(data.countBArray[0].constructor).eql(Number);
    should(data.countBArray).eql([56, 345, 234]);
    should(data.deletedB.constructor).eql(Boolean);
    should(data.deletedB).eql(false);
    should(data.createdB.constructor).eql(Date);
    // @ts-ignore - 'toJSON' does not exist on type 'number'
    should(data.createdB.toJSON()).eql('2016-11-21T08:34:04.995Z');
  });
  it('should cast Array of Objects', async () => {
    var data = [
      {age: '21', pi: '3.14159265359'},
      {age: '33', pi: '3.14159265359'},
    ];

    var schema = new Schema({
      age: Number,
      pi: Number
    });

    await schema.validate(data);

    should(data[0].age).eql(21);
    should(data[0].pi).eql(3.14159265359);
    should(data[1].age).eql(33);
    should(data[1].pi).eql(3.14159265359);
  });
  it('should generate error if failed to cast to Number', async () => {
    var data = {age: 'fifty'};

    var schema = new Schema({
      age: Number
    });

    const result = await schema.validate(data);

    should(result.isValid).eql(false);
    should(data.age).eql(NaN);
  });
  it('should cast embedded objects', async () => {
    var data = {house: {bedRooms: '3', discounted: '1'}};

    var schema = new Schema({
      house: {
        bedRooms: Number,
        discounted: Boolean
      }
    });

    await schema.validate(data);

    should(data.house.bedRooms).eql(3);
    should(data.house.discounted).eql(true);
  });
  it('should cast array with embedded objects', async () => {
    var data = [
      {house: {bedRooms: '3', discounted: '1'}},
      {house: {bedRooms: '2', discounted: '0'}}
    ];

    var schema = new Schema({
      house: {
        bedRooms: Number,
        discounted: Boolean
      }
    });

    await schema.validate(data);

    should(data[0].house.bedRooms).eql(3);
    should(data[0].house.discounted).eql(true);
    should(data[1].house.bedRooms).eql(2);
    should(data[1].house.discounted).eql(false);
  });
  it('should cast embedded array of Number', async () => {
    var data = {hotel: {roomsNumbers: ['200', '212', '302']}};

    var schema = new Schema({
      hotel: {
        roomsNumbers: [Number]
      }
    });

    await schema.validate(data);

    should(data.hotel.roomsNumbers[0]).eql(200);
    should(data.hotel.roomsNumbers[1]).eql(212);
    should(data.hotel.roomsNumbers[2]).eql(302);
  });
  it('should cast embedded array of objects', async () => {
    var data = {house: {rooms: [
      {name: 'bedroom', sleepHere: '1'},
      {name: 'kitchen', sleepHere: '0'},
      {name: 'bathroom', sleepHere: '0'},
    ]}};

    var schema = new Schema({
      house: {
        rooms: [{
          name: String, 
          sleepHere: Boolean
        }]
      }
    });

    await schema.validate(data);

    should(data.house.rooms[0].sleepHere).eql(true);
    should(data.house.rooms[1].sleepHere).eql(false);
    should(data.house.rooms[2].sleepHere).eql(false);
  });
  it('should cast embedded array of arrays', async () => {
    var data = {house: {rooms:
      [
        [
          {name: 'bedroom', sleepHere: '1'},
          {name: 'kitchen', sleepHere: '0'},
        ],
        [
          {name: 'bathroom', sleepHere: '0'}
        ]
      ]
    }};

    var schema = new Schema({
      house: {
        rooms: [[{
          name: String,
          sleepHere: Boolean
        }]]
      }
    });

    await schema.validate(data);

    should(data.house.rooms[0][0].sleepHere).eql(true);
    should(data.house.rooms[0][1].sleepHere).eql(false);
    should(data.house.rooms[1][0].sleepHere).eql(false);
  });
  it('should cast match-all fields', async () => {
    var data = {
      field1: '21',
      field2: '3.14159265359',
      field3: '0',
    };

    var schema = new Schema({
      '*': {$type: Number}
    });

    await schema.validate(data);

    should(data.field1).eql(21);
    should(data.field2).eql(3.14159265359);
    should(data.field3).eql(0);
  });
  it('should cast match-all fields of arrays', async () => {
    var data = {
      field1: ['1', '2', '3'],
      field2: ['3.14159265359'],
      field3: ['0', '3', '7'],
    };

    var schema = new Schema({
      '*': [Number]
    });

    await schema.validate(data);

    should(data.field1).eql([1, 2, 3]);
    should(data.field2).eql([3.14159265359]);
    should(data.field3).eql([0, 3, 7]);
  });
  it('should not attempt to cast custom Object constructor', async () => {
    class TestType {name: string};

    var data = new TestType;
    data.name = 'Kevin';

    var schema = new Schema({
      name: String
    });

    await schema.validate(data);

    should(data.name).eql('Kevin');
  });
  it('should not attempt to cast custom Array constructor', async () => {
    class MyArray extends Array {};
    const colors = new MyArray;
    colors.push('red');
    colors.push('yellow');

    class TestType {colors:string[]};

    var data = new TestType;
    data.colors = colors;

    var schema = new Schema({
      colors: Array
    });

    await schema.validate(data);

    should(data.colors[0]).eql('red');
  });
});
