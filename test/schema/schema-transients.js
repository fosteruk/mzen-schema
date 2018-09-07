var should = require('should');
var Schema = require('../../src/schema');
var Types = require('../../src/schema/types');

class ConstructorTestUser
{
  getName()
  {
    return this.nameFirst + ' ' + this.nameLast;
  }
}

class ConstructorTestAddress
{
  getStreet()
  {
    return this.street;
  }
}

describe('Schema', function() {
  describe('applyTransients', function() {
    it('should apply $construct function to the root object', function() {
      var object = {nameFirst: 'John', nameLast: 'Smith'};

      var schema = new Schema({
        $construct: ConstructorTestUser,
        nameFirst: String,
        nameLast: String
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.constructor).eql(ConstructorTestUser);
      should(object.getName()).eql('John Smith');
    });
    it('should apply $construct function to the embedded objects', function() {
      var object = {
        userMostPopular: {
          nameFirst: 'John',
          nameLast: 'Smith',
        },
        userLeastPopular: {
          nameFirst: 'Tom',
          nameLast: 'Jones',
        }
      };

      var schema = new Schema({
        userMostPopular: {
          $construct: ConstructorTestUser,
          nameFirst: 'John',
          nameLast: 'Smith',
        },
        userLeastPopular: {
          $construct: ConstructorTestUser,
          nameFirst: 'Tom',
          nameLast: 'Jones',
        }
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.userMostPopular.constructor).eql(ConstructorTestUser);
      should(object.userMostPopular.getName()).eql('John Smith');
      should(object.userLeastPopular.constructor).eql(ConstructorTestUser);
      should(object.userLeastPopular.getName()).eql('Tom Jones');
    });
    it('should apply $construct function to the root object as referenced by constrcutor name', function() {
      var object = {nameFirst: 'John', nameLast: 'Smith'};

      var schema = new Schema({
        $construct: 'ConstructorTestUser',
        nameFirst: String,
        nameLast: String
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.constructor).eql(ConstructorTestUser);
      should(object.getName()).eql('John Smith');
    });
    it('should apply $construct function to the embedded objects as referenced by constrcutor name', function() {
      var object = {
        userMostPopular: {
          nameFirst: 'John',
          nameLast: 'Smith',
        },
        userLeastPopular: {
          nameFirst: 'Tom',
          nameLast: 'Jones',
        }
      };

      var schema = new Schema({
        userMostPopular: {
          $construct: 'ConstructorTestUser',
          nameFirst: 'John',
          nameLast: 'Smith',
        },
        userLeastPopular: {
          $construct: 'ConstructorTestUser',
          nameFirst: 'Tom',
          nameLast: 'Jones',
        }
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.userMostPopular.constructor).eql(ConstructorTestUser);
      should(object.userMostPopular.getName()).eql('John Smith');
      should(object.userLeastPopular.constructor).eql(ConstructorTestUser);
      should(object.userLeastPopular.getName()).eql('Tom Jones');
    });
    it('should apply $construct function according to array spec', function() {
      var object = {
        users: [
          {nameFirst: 'John', nameLast: 'Smith'},
          {nameFirst: 'Tom', nameLast: 'Jones'}
        ]
      };

      var schema = new Schema({
        users: [
          {
            $construct: 'ConstructorTestUser',
            nameFirst: String,
            nameLast: String
          }
        ]
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.users[0].constructor).eql(ConstructorTestUser);
      should(object.users[0].getName()).eql('John Smith');
      should(object.users[1].constructor).eql(ConstructorTestUser);
      should(object.users[1].getName()).eql('Tom Jones');
    });
    it('should apply $construct function according to array spec object', function() {
      var object = {
        users: [
          {nameFirst: 'John', nameLast: 'Smith'},
          {nameFirst: 'Tom', nameLast: 'Jones'}
        ]
      };

      var schema = new Schema({
        users: {
          $type: Array,
          $spec: {
            $construct: 'ConstructorTestUser',
            nameFirst: String,
            nameLast: String
          }
        }
      }, {
        constructors: [ConstructorTestUser]
      });

      object = schema.applyTransients(object);
      should(object.users[0].constructor).eql(ConstructorTestUser);
      should(object.users[0].getName()).eql('John Smith');
      should(object.users[1].constructor).eql(ConstructorTestUser);
      should(object.users[1].getName()).eql('Tom Jones');
    });
    it('should apply $construct function to schemaRelation', function() {
      var object = {
        nameFirst: 'John',
        nameLast: 'Smith',
        address: {street: 'Picton Road'}
      };

      var schemaAddress = new Schema({
        $name: 'address',
        $construct: ConstructorTestAddress,
        street: {$type: 'String', $validate: {notNull: true}},
      });

      var schema = new Schema({
        $construct: ConstructorTestUser,
        nameFirst: String,
        nameLast: String,
        address: {$schema: 'address', $relation: true}
      });
      schema.addConstructor(ConstructorTestUser);
      schema.addConstructor(ConstructorTestAddress);
      schema.addSchema(schemaAddress);

      object = schema.applyTransients(object);
      should(object.constructor).eql(ConstructorTestUser);
      should(object.getName()).eql('John Smith');
      should(object.address.constructor).eql(ConstructorTestAddress);
      should(object.address.getStreet()).eql('Picton Road');
    });
    it('should apply $pathRef value', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        address: {
          userId: {$pathRef: '_id'},
          postcode: 'L1'
        }
      });

      user = schema.applyTransients(user);
      should(user.address.userId).eql('123');
    });
    it('should apply $pathRef value deep', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        a: {
          b: {
            c:  {
              userId: {$pathRef: '_id'}
            }
          }
        }
      });

      user = schema.applyTransients(user);
      should(user.a.b.c.userId).eql('123');
    });
  });
  describe('stripTransients', function() {
    it('should should strip $pathRef value', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        address: {
          userId: {$pathRef: '_id'},
          postcode: 'L1'
        }
      });

      user = schema.applyTransients(user);
      should(user.address.userId).eql('123');
      user = schema.stripTransients(user);
      should(user.address.userId).eql(undefined);
    });
    it('should should strip $pathRef value deep', function() {
      var user = {
        _id: '123',
        address: {
          postcode: 'L1'
        }
      };

      var schema = new Schema({
        _id: 'String',
        a: {
          b: {
            c:  {
              userId: {$pathRef: '_id'}
            }
          }
        }
      });

      user = schema.applyTransients(user);
      should(user.a.b.c.userId).eql('123');
      user = schema.stripTransients(user);
      should(user.a.b.c.userId).eql(undefined);
    });
  });
});
