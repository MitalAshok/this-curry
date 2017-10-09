/**
 * curry.js (MIT, see LICENSE)
 * By MitalAshok
 */

;(function(root, name, value) {
  // Export function
  var factory = function() { return value; }; var global_define = typeof define === 'function' && typeof define.amd === 'object' && define; if (global_define) { /* AMD */ global_define([], factory); global_define(name, [], factory); /* Don't return; Define in root too if possible. */ } var global_module = typeof module === 'object' && module && module.exports && !module.nodeType && module; if (global_module) { /* Node */ global_module.exports = value; return; } var global_global = typeof global === 'object' && global && global.global === global && global; var global_window = typeof window === 'object' && window && window.window === window && window; root = global_window || global_global || root || {}; /* Web browser or other */ root[name] = value;
}(this, 'curry', function() {
  'use strict';

  function default_validator(args, required_length /*, f, name */) {
    // this; is useful too
    return args.length >= required_length;
  }

  /* Example validators

  function(args) {
    return this.length >= length;
  }

  function(args) {
    return args[args.length - 1] instanceof int;
  }

  function() {
    return this.ready;
  }

   */

  /** See documentation */
  function curry(f, options) {
    if (arguments.length === 0) {
      // Make `curry` curried.
      return curry;
    }

    options = options || {
      length: f.length,
      validator: default_validator,
      latest_this: false,
      name: f.name
    };

    var length = options.length;
    if (length == null) {
      length = f.length;
    }
    var latest_this = options.latest_this;
    var name = options.name;
    if (name == null) {
      name = f.name;
    }
    var validator = options.validator || default_validator;
    var that = this;

    function outer_curried_function() {
      var this_value = latest_this ? this : that;
      var args = arguments;
      var is_valid = validator.call(this_value, args, length, f, name);

      if ((typeof (is_valid)) === 'object') {
        is_valid = is_valid || {};
        if ('this' in is_valid) this_value = is_valid['this'];
        else if ('that' in is_valid) this_value = is_valid.that;
        args = is_valid.args || args;
        if (is_valid.length != null) length = is_valid.length;
        f = is_valid.f || f;
        if (is_valid.name != null) name = is_valid.name;
        is_valid = is_valid.valid;
      }

      if (is_valid) {
        return f.apply(this_value, args);
      }

      args = slice.call(args);

      var curried_function = function curried_function() { return outer_curried_function.apply(this, args.concat(slice.call(arguments))); };

      var g = set_values(curried_function, length - args.length, name);

      g.args = args.slice();
      g['this'] = g.that = latest_this ? this : that;
      g.f = f;
      g.required_length = length;

      return g;
    }

    var real_validator = validator;
    validator = function() { return false; };
    var inner_curried_function = outer_curried_function();
    validator = real_validator;
    return inner_curried_function;
  }

  var slice = Array.prototype.slice;

  function set_values_fast(f, length, name) {
    length = +length || 0;
    if (length < 0) {
      length = 0;
    }
    Object.defineProperty(f, 'length', { value: length });
    Object.defineProperty(f, 'name', { value: name });
    return f;
  }

  function set_values_compat(f, length, name) {
    if (name) {
      name = ' ' + name;
    } else {
      name = '';
    }
    var args = '';
    length = length || 0;
    var first = true;
    for (var i = 0; i < length; i++) {
      args += (first ? (first = false, '') : ', ') + 'X' + i;
    }
    return eval(
      '(function' + name + '(' + args +
      ') {\n  return f.apply(this, arguments);\n});'
    );
  }

  var set_values = Object.defineProperty ? set_values_fast : set_values_compat;

  curry.default_validator = default_validator;
  curry.limit_args = function(args, required_length) {
    if (args.length <= required_length) {
      return args.length === required_length;
    }
    return {
      args: slice.call(args, 0, required_length),
      valid: true
    };
  };
  curry.curry = curry;
  return curry;
}()));
