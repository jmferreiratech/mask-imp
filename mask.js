const translation = {
    "0": {pattern: /\d/},
    "#": {pattern: /\d/, recursive: true},
    "9": {pattern: /\d/, optional: true},
};

class MaskImp {

    constructor(mask, config = {reverse: false, default: false, hint: false}) {
        this._mask = mask;
        this._config = config;
    }

    masked(value) {
        value += "";
        let mask = typeof this._mask === 'function' ? this._mask(value) : this._mask;
        if (this._config.reverse) {
            mask = mask.split("").reverse().join("");
            value = value.split("").reverse().join("");
        }
        const buf = this._maskIt(mask, value);
        return this._config.reverse ? buf.reverse().join("") : buf.join("");
    }

    unmasked(value) {
        const mask = typeof this._mask === 'function' ? this._mask(value) : this._mask;

        const index = value.split("").findIndex(c => !mask.includes(c));
        let result = index >= 0 ? value.slice(index) : "";

        mask.split("")
            .filter(isConstant)
            .forEach(m => {
                result = result.replace(m, "");
            });
        return result;
    }

    _maskIt(mask, value, result = [], resetPos = null) {
        if (mask.length === 0 || value.length === 0)
            return [...result, ...this._suffix(mask)];
        if (!isConstant(mask[0])) {
            const trans = translation[mask[0]];
            if (value.charAt(0).match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos)
                        resetPos = mask;
                    else if (mask.length === 1)
                        return this._maskIt(resetPos, value.substring(1), result.concat(value.charAt(0)), resetPos);
                }
                return this._maskIt(mask.substring(1), value.substring(1), result.concat(value.charAt(0)), resetPos);
            }
            if (trans.optional)
                return this._maskIt(mask.substring(1), value, result, resetPos);
            return this._maskIt(mask, value.substring(1), result, resetPos);
        }
        return this._maskIt(mask.substring(1), value, result.concat(mask[0]), resetPos);
    }

    _suffix(mask) {
        let cte = "";
        if (this._config.hint && isConstant(mask[0])) {
            cte = mask[0];
            mask = mask.slice(1);
        }
        const reversedMask = this._config.reverse && this._config.default ? mask.split("") : mask.split("").reverse();
        const lastMapChar = reversedMask.findIndex(m => !isConstant(m) && (!this._config.default || (translation[m].optional || translation[m].recursive)));
        const result = reversedMask.filter((m, i) => i < lastMapChar || lastMapChar === -1);
        return cte + (this._config.reverse && this._config.default ? result.join("") : result.reverse().join(""));
    }
}

function isConstant(maskChar) {
    return maskChar && !translation[maskChar];
}

module.exports = (mask, config) => new MaskImp(mask, config);
