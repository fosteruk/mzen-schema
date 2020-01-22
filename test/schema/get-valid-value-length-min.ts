import should = require('should');
import Schema from '../../lib/schema';

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

    const validValues = schema.getValidValueLengthMin('model');

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

    const validValues = schema.getValidValueLengthMin('model.*.synth');

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

    const validValues = schema.getValidValueLengthMin('model.synth.bestSeller');

    should(validValues).eql(18);
  });
});

