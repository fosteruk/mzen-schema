import should = require('should');
import SchemaManager from '../lib/manager';
import Schema from '../lib/schema';

describe('SchemaManager', function(){
  describe('init()', function(){
    it('should inject schemas into each schema', async () => {
      var userSchema = new Schema({$name: 'user'});
      var orderSchema = new Schema({$name: 'order'});

      should(userSchema.schemas.user).be.undefined();
      should(userSchema.schemas.order).be.undefined();
      should(orderSchema.schemas.user).be.undefined();
      should(orderSchema.schemas.order).be.undefined();

      var schemaManager = new SchemaManager();
      schemaManager.addSchema(userSchema);
      schemaManager.addSchema(orderSchema);

      await schemaManager.init();

      should(userSchema.schemas.user).eql(userSchema);
      should(userSchema.schemas.order).eql(orderSchema);
      should(orderSchema.schemas.user).eql(userSchema);
      should(orderSchema.schemas.order).eql(orderSchema);
    });
    it('should inject constructors into each schema', async () => {
      var User = function(){};
      var Order = function(){};

      var userSchema = new Schema({$name: 'user'});
      var orderSchema = new Schema({$name: 'order'});

      should(userSchema.constructors.User).be.undefined();
      should(userSchema.constructors.Order).be.undefined();
      should(orderSchema.constructors.User).be.undefined();
      should(orderSchema.constructors.Order).be.undefined();

      var schemaManager = new SchemaManager();
      schemaManager.addSchema(userSchema);
      schemaManager.addSchema(orderSchema);
      schemaManager.addConstructor(User);
      schemaManager.addConstructor(Order);

      await schemaManager.init();

      should(userSchema.constructors.User).eql(User);
      should(userSchema.constructors.Order).eql(Order);
      should(orderSchema.constructors.User).eql(User);
      should(orderSchema.constructors.Order).eql(Order);
    });
  });
});
