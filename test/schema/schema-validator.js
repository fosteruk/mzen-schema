var should = require('should');
var Schema = require('../../src/schema');
var Validator = require('../../src/schema/validator');

describe('Schema', function () {
  describe('validator', function () {
    describe('required', function () {
      it('should return boolean true on success', function () {
        var value = 'Kevin';
        var result = Validator.required(value);

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = undefined;
        var result = Validator.required(value);

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = undefined;
        var result = Validator.required(value, {message: 'Name is required'});

        should(result).equal('Name is required');
      });
    });
    describe('notNull', function () {
      it('should return boolean true on success', function () {
        var value = 'Kevin';
        var result = Validator.notNull(value);

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = null;
        var result = Validator.notNull(value);

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = null;
        var result = Validator.notNull(value, {message: 'Name can not be null'});

        should(result).equal('Name can not be null');
      });
    });
    describe('notEmpty', function () {
      it('should return boolean true on success', function () {
        var value = 'Kevin';
        var result = Validator.notEmpty(value);

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = '';
        var result = Validator.notEmpty(value);

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = '';
        var result = Validator.notEmpty(value, {message: 'Name can not be empty'});

        should(result).equal('Name can not be empty');
      });
    });
    describe('regex', function () {
      it('should return boolean true on success', function () {
        var value = 'Kevin';
        var result = Validator.regex(value, {pattern: '^[a-zA-Z]+$'});

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = '123';
        var result = Validator.regex(value, {pattern: '^[a-zA-Z]+$'});

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = '123';
        var result = Validator.regex(value, {pattern: '^[a-zA-Z]+$', message: 'Name does appears to be valid'});

        should(result).equal('Name does appears to be valid');
      });
    });
    describe('email', function () {
      it('should return boolean true on success', function () {
        var value = 'foobar@gmail.com';
        var result = Validator.email(value);

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = 'not an email';
        var result = Validator.email(value);

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = 'not an email';
        var result = Validator.email(value, {message: 'Email does appears to be valid'});

        should(result).equal('Email does appears to be valid');
      });
    });
    describe('valueLength', function () {
      it('should return boolean true on success', function () {
        var value = '456756789';
        var result = Validator.valueLength(value, {min: 2, max: 9});

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = '456756789';
        var result = Validator.valueLength(value, {min: 20, max: 50});

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = '456756789';
        var result = Validator.valueLength(value, {min: 20, max: 50, message: 'Code should be between 10 and 50 characters long'});

        should(result).equal('Code should be between 10 and 50 characters long');
      });
    });
    describe('equality', function () {
      it('should return boolean true on success', function () {
        var value = {a: 123, b: 123};
        var result = Validator.equality(value.a, {path: 'b', name: 'A', root: value});

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = {a: 123, b: 4567};
        var result = Validator.equality(value.a, {path: 'b', name: 'A', root: value});

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = {a: 123, b: 4567};
        var result = Validator.equality(value.a, {path: 'b', name: 'A', root: value, message: 'Values do not match'});

        should(result).equal('Values do not match');
      });
    });
    describe('enumeration', function () {
      it('should return boolean true on success', function () {
        var value = 'Car';
        var result = Validator.enumeration(value, {name: 'Transport', values: ['Car', 'Bus', 'Train', 'Boat']});

        should(result).be.true(result === true);
      });
      it('should return error message on failure', function () {
        var value = 'Guitar';
        var result = Validator.enumeration(value, {name: 'Transport', values: ['Car', 'Bus', 'Train', 'Boat']});

        should(result).be.a.String();
      });
      it('should allow custom message', function () {
        var value = 'Guitar';
        var result = Validator.enumeration(value, {name: 'Transport', values: ['Car', 'Bus', 'Train', 'Boat'], message: 'Value is not valid'});

        should(result).equal('Value is not valid');
      });
    });
  });
});
