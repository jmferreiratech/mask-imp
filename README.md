# mask-imp

An imperative masking/formatting component

mask-imp is intended to mask any html input element, specially thought to be used with [react controlled components](https://reactjs.org/docs/forms.html#controlled-components).

### Installation

`npm install mask-imp`

### Usage

```
import MaskImp from 'mask-imp';

const mask = MaskImp("#.##0,00 €", {reverse: true});

mask.masked("154735975");
// returns "1.547.359,75 €"

mask.unmasked("1.547.359,75 €");
// returns "154735975"
```

With react you'll usually use the `masked` method on an input's value attribute and the `unmasked` method before calling setState.

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
const number = MaskImp("#.##0,00", {defaultValue: true, reverse: true});

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

For more use cases, please look into the test file.

### Dependencies
It has no dependencies on jQuery or any other framework/library.

### API
It provides a simple API with two methods: masked and unmasked. The mask format itself is pretty the same as the used by [jQuery-Mask-Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin).
