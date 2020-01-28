import should = require('should');
import Schema from '../../lib/schema';

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