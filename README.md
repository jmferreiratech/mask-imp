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

### Dependencies
It has no dependencies on jQuery or any other framework/library.

### API
It provides a simple API with two methods: masked and unmasked. The mask format itself is pretty the same as the used by [jQuery-Mask-Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin).
