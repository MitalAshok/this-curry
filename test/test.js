var a = require('assert');
var curry = require('../curry');

function eq(actual, expected, message) {
  if (Array.isArray(actual) || Array.isArray(expected)) {
    return a.deepStrictEqual(actual, expected, message);
  }
  return a.strictEqual(actual, expected, message);
}

function ne(actual, expected, message) {
  if (Array.isArray(actual) || Array.isArray(expected)) {
    return a.notDeepStrictEqual(actual, expected, message);
  }
  return a.notStrictEqual(actual, expected, message);
}

describe('curry', function() {
  function sum(a, b, c) { return a + b + c; }
  var c_sum = curry(sum);

  it('should return a curried version of a function', function() {
    eq(c_sum(1)(2)(3), sum(1, 2, 3));
  });

  it('should retain length', function() {
    eq(c_sum.length, sum.length);
  });

  it('should accept a length', function() {
    var new_length = 4;
    eq(curry(sum, {length: new_length}).length, new_length);
  });

  it('should be affected by the length', function() {
    var get_args = function(a, b, c) { return [a, b, c]; };
    var c_get_args_l = curry(get_args, {length: 2});
    var c_get_args_g = curry(get_args, {length: 4});

    eq(c_get_args_l(1)(2), get_args(1, 2, undefined));
    eq(c_get_args_l(1)(2, 3), get_args(1, 2, 3));
    ne(c_get_args_g(1)(2)(3), get_args(1, 2, 3));
    eq(c_get_args_g(1)(2)(3)(999), get_args(1, 2, 3));
  });

  it('should pass extra arguments', function() {
    var get_args = function() { return Array.prototype.slice.call(arguments); };
    var c_get_args = curry(get_args);
    eq(c_get_args(), []);
    eq(c_get_args(1, 2, 3), [1, 2, 3]);
  });

  it('should limit arguments to length if specified', function() {
    var get_args = function(a, b, c) { return Array.prototype.slice.call(arguments); };
    var c_get_args = curry(get_args, { validator: curry.limit_args });
    eq(c_get_args(1, 2, 3, 999), [1, 2, 3]);
    eq(c_get_args(1, 2)(3, 999), [1, 2, 3]);
  });

  it('should retain name', function() {
    eq(sum.name, c_sum.name);
  });

  it('should accept a name', function() {
    var new_name = 'c_sum';
    eq(curry(sum, {name: new_name}).name, new_name);
  });

  it('should return a pure function', function() {
    var expected = sum(1, 2, 3);
    var c_sum_1 = c_sum(1);
    eq(c_sum(1)(2)(3), expected);
    eq(c_sum_1(2)(3), expected);
  });

  it('should accept multiple arguments', function() {
    var expected = sum(1, 2, 3);
    eq(c_sum(1, 2, 3), expected);
    eq(c_sum(1, 2)(3), expected);
    eq(c_sum(1)(2, 3), expected);
  });

  it('should retain the first context', function() {
    var add = function(a, b) { return this + a + b; };
    var c_add = curry.call(1, add);
    eq(c_add.call(999, 2, 3), add.call(1, 2, 3));
    eq(c_add.call(999, 2).call(999, 3), add.call(1, 2, 3));
  });

  it('should use last context if specified', function() {
    var add = function(a, b) { return this + a + b };
    var c_add = curry.call(999, add, { latest_this: true });
    eq(c_add.call(1, 2, 3), add.call(1, 2, 3));
    eq(c_add.call(999, 2).call(1, 3), add.call(1, 2, 3));
  });

  it('should have arguments be accessible', function() {
    eq(c_sum.args, []);
    eq(c_sum(1).args, [1]);
    eq(curry.call(1, sum)['this'], 1);
    eq(curry.call(999, sum, { latest_this: true }).call(1, 999)['this'], 1);
  });

  it('should accept a custom validator function', function() {
    var validator_args;
    var valid = false;
    var validator = function(args, required_length, f, name) {
      validator_args = [this, Array.prototype.slice.call(args), required_length, f, name];
      return valid;
    };
    function a(a, b) { return a + b; }
    var context = {a: 1};
    var c = curry.call(context, a, { validator: validator })(2, 3);
    ne(c, 2 + 3);
    eq(validator_args, [context, [2, 3], 2, a, 'a']);

    valid = true;
    eq(c(), 2 + 3);
  });
});