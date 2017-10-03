'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeCaster = require('../type-caster');

var Filter = function () {
  function Filter() {
    (0, _classCallCheck3.default)(this, Filter);
  }

  (0, _createClass3.default)(Filter, null, [{
    key: 'filter',
    value: function filter(value, filters, name, root) {
      var results = true;
      var promises = [];

      var promise = Promise.resolve();
      Object.keys(filters).forEach(function (filterName) {
        var filter = Filter[filterName];
        if (typeof filter != 'function') throw new Error('Uknown filter "' + filterName + '"');

        if (filters[filterName] === false || filters[filterName] == undefined) return; // Falsey value disabled the filter  

        var options = !filters[filterName] || typeof filters[filterName] == 'boolean' ? {} : filters[filterName];
        // If options is an array we run the filter multiple times 
        // - one for each options object id
        options = Array.isArray(options) ? options : [options];

        options.forEach(function (opts) {
          promise = promise.then(function () {
            // We only validate if we dont already have an error 
            if (results === true) {
              // filter fucntion can return a promise but it may also return boolean, string or array
              // - we must first resolve the return value to ensure we have promise
              return Promise.resolve(filter(value, opts, name, root)).then(function (result) {
                if (result !== true) {
                  // filter function can return either true, a single message string or an array of error messages
                  // - the main filter() method returns a promise that resolves to true or an array of error messages
                  // - We already know the current result is not true so lets ensure we have an array of errors
                  result = Array.isArray(result) ? result : [result];

                  if (Array.isArray(results)) {
                    results = results.concat(result);
                  } else {
                    results = result;
                  }
                }
              });
            }
          });
        });
      });

      var promise = promise.then(function () {
        return results;
      });

      return promise;
    }

    // Validator function
    // - returns an error message string or an array of error messages on failure otherwise returns boolean true

  }, {
    key: 'trim',
    value: function trim(value, options, name, root) {}
  }, {
    key: 'uppercase',
    value: function uppercase(value, options, name, root) {}
  }, {
    key: 'lowercase',
    value: function lowercase(value, options, name, root) {}

    // Custom filter allows you to specify your own filter function 
    // - the function should return boolean true for a valid value
    // - or return an error message string or an array of error messages

  }, {
    key: 'custom',
    value: function custom(value, options, name, root) {
      var filter = options && options['filter'] ? options['filter'] : function () {
        return true;
      };
      return filter(value, options, name, root);
    }
  }]);
  return Filter;
}();

module.exports = Filter;