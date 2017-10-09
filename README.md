# this-curry
A simple and flexible way to curry functions, preserving `this`.

## Install

Download the package through [`npm`](https://www.npmjs.com/package/this-curry):

```bash
$ npm install this-curry
```

Or download it from source.

## Usage

```javascript
// In the browser
<script src="/js/this-curry"></script>
// Use `window.curry`

// In Node
var curry = require('this-curry');
```

## Syntax

```javascript
curry(f, options)
```

- *`f`*: The function to curry.  
- *`options`*: An options object that specifies the behaviour of the curried function. The available options are:

  - *`length`*: The expected length of the function. Usually determines how many arguments need to be passed before calling the function. Defaults to `function.length`.  
  - *`latest_this`*: If `true`, use the context of the last call of the curried function when calling the given function, instead of saving the first. Defaults to `false` (Use the `this` that `curry` was called with).  
  - *`name`*: Name of the curried function. Defaults to `f.name`.  
  - *`validator`*: See [customisations](#customisations).

### Examples

```javascript
var sum = curry(function sum(a, b, c) {
  return a + b + c;
});

sum(1, 2, 3);
sum(1, 2)(3);
sum(1)(2, 3);
sum()(1)()(2)()()(3);  // All 6


var body_event_listener = curry.call(document.body, EventTarget.prototype.addEventListener, {
  length: 3
});


var body_on_click = body_event_listener('click');
var body_on_keydown = body_event_listener('keydown');

body_on_click(function(e) {
    // ...
}, false);
```

## Customisations

`options.validator` should be a function that is called every time the curried function is called.

It is called with 4 arguments, `args`, `length`, `f`, `name`.

  - *`args`* is an [`Arguments`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/arguments) object of the arguments that have been passed so far.  
  - *`required_length`* is the length of the function.  
  - *`f`* is the original (uncurried) function.  
  - *`name`* is the name of the function.

It is also called with the context (`this`) that would call `f` if it needs to be called right now.

`options.validator` should return either `true`, `false` or another object.

If it returns `false`, the curried function returns another curried function, possible with some more arguments filled in.

If it returns `true`, the curried function calls the original function with the arguments that were given.

If it returns an object, that object could have the following properties:

  - *`this`*: The new value for the context to call the original function with. (Alternatively `that` for linters that complain about the reserved word `this`)  
  - *`args`*: The new value for the arguments to call the original function with. Useful to remove invalid arguments. Should be an Array.  
  - *`length`*: The new value for the number of arguments before the function should be called. Passed as the `length` parameter to the validator function.  
  - *`f`*: The new function to replace the original function. For example, to change which function is called based on an argument.  
  - *`is_valid`*: A boolean for whether or not the function should be called. It is called if `true`. Defaults to `false`.

The default validator is `curry.default_validator`, which is simply:

```javascript
function default_validator(args, required_length) {
  return args.length >= required_length;
}
```

(Which just checks if the length of the arguments is not less than the required length)

Another validator given is `curry.limit_args`, which will not pass in extra arguments, by returning an object with `args` sliced to the required length.

```javascript
function add(a, b) {
  return a + b;
}

function sum() {
  return Array.prototype.reduce.call(arguments, add, 0);
}

var sum_5_or_more = curry(sum, { length: 5 });
var sum_5 = curry(sum, { length: 5, validator: limit_args });

sum_5_or_more(1)(2, 3, 4)(5, 6, 7);  // 28
sum_5        (1)(2, 3, 4)(5, 6, 7);  // 15, as 6 and 7 are ignored.
```
