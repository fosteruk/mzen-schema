import should = require('should');
import Schema from '../lib/schema';

describe('SchemaInquisitor', function(){
  describe('getValidValueLengthMax', function(){
    it('should return max length for path', async () => {
      var schema = new Schema({
        model: {
          $type: Array,
          $validate: {
            valueLength: {max: 3}
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMax('model');
      should(validValues).eql(3);
    });
    it('should return max length for array path', async () => {
      var schema = new Schema({
        model: [
          {
            synth: {
              $type: Array,
              $validate: {
                valueLength: {max: 9}
              }
            }
          }
        ]
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMax('model.*.synth');
      should(validValues).eql(9);
    });
    it('should return max length for deep path', async () => {
      var schema = new Schema({
        model: {
          synth: {
            bestSeller: {
              $type: Array,
              $validate: {
                valueLength: {max: 18}
              }
            }
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMax('model.synth.bestSeller');
      should(validValues).eql(18);
    });
  });

  describe('getValidValueLengthMin', function(){
    it('should return min length for path', async () => {
      var schema = new Schema({
        model: {
          $type: Array,
          $validate: {
            valueLength: {min: 3}
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMin('model');
      should(validValues).eql(3);
    });
    it('should return min length for array path', async () => {
      var schema = new Schema({
        model: [
          {
            synth: {
              $type: Array,
              $validate: {
                valueLength: {min: 9}
              }
            }
          }
        ]
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMin('model.*.synth');
      should(validValues).eql(9);
    });
    it('should return min length for deep path', async () => {
      var schema = new Schema({
        model: {
          synth: {
            bestSeller: {
              $type: Array,
              $validate: {
                valueLength: {min: 18}
              }
            }
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValueLengthMin('model.synth.bestSeller');
      should(validValues).eql(18);
    });
  });  

  describe('getValidValues', function(){
    it('should return array of valid inArray validate values for path', async () => {
      var schema = new Schema({
        model: {
          $type: Array,
          $validate: {
            inArray: {values: ['A', 'B', 'C']}
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValues('model');
      should(validValues).eql(['A', 'B', 'C']);
    });
    it('should return array of valid inArray validate values for array path', async () => {
      var schema = new Schema({
        model: [
          {
            synth: {
              $type: Array,
              $validate: {
                inArray: {values: ['A', 'B', 'C']}
              }
            }
          }
        ]
      });
      const validValues = schema.getInquisitor()
        .getValidValues('model.*.synth');
      should(validValues).eql(['A', 'B', 'C']);
    });
    it('should return array of valid inArray validate values for deep path', async () => {
      var schema = new Schema({
        model: {
          synth: {
            bestSeller: {
              $type: Array,
              $validate: {
                inArray: {values: ['A', 'B', 'C']}
              }
            }
          }
        }
      });
      const validValues = schema.getInquisitor()
        .getValidValues('model.synth.bestSeller');
      should(validValues).eql(['A', 'B', 'C']);
    });
  });
});
