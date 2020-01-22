import should = require('should');
import Schema from '../../lib/schema';

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

    const validValues = schema.getValidValues('model');

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

    const validValues = schema.getValidValues('model.*.synth');

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

    const validValues = schema.getValidValues('model.synth.bestSeller');

    should(validValues).eql(['A', 'B', 'C']);
  });
});

