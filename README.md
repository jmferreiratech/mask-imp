# mask-imp

An imperative masking/formatting component

mask-imp is intended to mask any html input element, specially thought to be used with [react controlled components](https://reactjs.org/docs/forms.html#controlled-components).

### Installation

`npm install mask-imp`

### Usage

```
import MaskImp from 'mask-imp';

const pattern = "#.##0,00 €";
const options = {reverse: true};
const mask = MaskImp(pattern, options);

mask.masked("154735975");
// returns "1.547.359,75 €"

mask.unmasked("1.547.359,75 €");
// returns "154735975"
```

With react you'll usually use the `masked` method on an input's value attribute and the `unmasked` method before calling setState.

#### Pattern dictionary
The default pattern dictionary contains:
* `0`: match a single digit
* `9`: match zero or one digit (i.e optional)
* `#`: match one or more digits (i.e recursive)
* `S`: match a single alphabetic character (case insensitive)
* `~`: match a single number signal ("+" or "-") and fallback to "+" (number always with signal)
* `^`: match zero or one number signal (number with entered signal)
* `=`: match zero or one negative number signal (number with negative signal only)

To escape a dictionary character prefix it with "!".
Any pattern character absent from the dictionary is considered constant.
To examples of dictionary expansion see [the tests file](https://github.com/jmarcelof/mask-imp/blob/master/mask.test.js).

#### Options values
* `reverse` (default false): input characters are feed from right to left
* `defaultValue` (default false): pattern characters are shown (except the recursive or optional ones)
* `placeholder` (default false): non constant pattern characters are shown as "_"
* `hint` (default false): shows the next const pattern character
* `dict` (default {}): allows insertion of new items to the dictionary (see [tests](https://github.com/jmarcelof/mask-imp/blob/master/mask.test.js) to examples of expansion)

### Examples

You can mask both strings and numbers:
```
const fixedDecimal = MaskImp("0.00");

fixedDecimal.masked("123");
// returns "1.23"

fixedDecimal.masked(1.23);
// returns "1.23"
```

Masks are by default direct (left-to-right), but you can make it reverse:
```
const fixedDecimal = MaskImp("0.00", {reverse: true});

fixedDecimal.masked("1");
// returns "1"
fixedDecimal.masked("12");
// returns "12"
fixedDecimal.masked("123");
// returns "1.23"
```

Masks can be recursive:
```
const recursiveDecimal = MaskImp("#.##0,00", {reverse: true});

recursiveDecimal.masked("154735975");
// returns "1.547.359,75"
```

Masks can have optional digits:
```
const ip = MaskImp("099.099.099.099");

ip.masked("255255255255");
// returns "255.255.255.255"

ip.masked("8.8.8.8");
// returns "8.8.8.8"

ip.masked("192168.10.5");
// returns "192.168.10.5"
```

You can force the default value (zero) to be shown:
```
const number = MaskImp("#.##0.00", {defaultValue: true, reverse: true});

number.masked("");
// returns "0.00"
number.masked("1");
// returns "0.01"
number.masked("12");
// returns "0.12"
number.masked("123");
// returns "1.23"
```

Or show the placeholder:
```
const cpf = MaskImp("000.000.000-00", {placeholder: true});

cpf.masked("");
// returns "___.___.___-__"
number.masked("6");
// returns "6__.___.___-__"
number.masked("668");
// returns "668.___.___-__"
number.masked("668533350");
// returns "668.533.350-__"
```

You can also: use prefix and suffix, extend the default dictionary, escape digits, mask alphabetic characters, pass a function as mask expression...

For more use cases, please look into [the test file](https://github.com/jmarcelof/mask-imp/blob/master/mask.test.js).

### Dependencies
It has no dependencies on jQuery or any other framework/library.

### API
It provides a simple API with two methods: masked and unmasked. The mask format itself is pretty the same as the used by [jQuery-Mask-Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin).
