const translation = {
    "0": {pattern: /\d/},
    '#': {pattern: /\d/, recursive: true},
};

class MaskImp {

    constructor(mask, config = {}) {
        this._mask = mask;
        this._config = config;
    }

    masked(value) {
        value += "";
        let mask = this._mask;
        if (this._config.reverse) {
            mask = mask.split("").reverse().join("");
            value = value.split("").reverse().join("");
        }
        const buf = this._maskIt(mask, value);
        return this._config.reverse ? buf.reverse().join("") : buf.join("");
    }

    _maskIt(mask, value, result = []) {
        if (mask.length === 0 || value.length === 0)
            return result;
        const trans = translation[mask[0]];
        if (trans) {
            if (value.charAt(0).match(trans.pattern)) {
                if (trans.recursive)
                    return this._maskIt(mask, value.substring(1), result.concat(value.charAt(0)));
                return this._maskIt(mask.substring(1), value.substring(1), result.concat(value.charAt(0)));
            }
            return this._maskIt(mask, value.substring(1), result);
        }
        return this._maskIt(mask.substring(1), value, result.concat(mask[0]));
    }
}

module.exports = (mask, config) => new MaskImp(mask, config);
