String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(
        new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")),
        (typeof(str2) === "string") ? str2.replace(/\$/g,"$$$$") : str2
    );
};

const translation = {
    "0": {pattern: /\d/},
    "#": {pattern: /\d/, recursive: true},
    "9": {pattern: /\d/, optional: true},
};
const placeholder = "_";

const reversed = (f, reverse = true) => (...params) => reverse ? f(...params.map(p => p.reverse())).reverse() : f(...params);

class MaskImp {

    constructor(mask, config = {reverse: false, default: false, hint: false, placeholder: false}) {
        this._mask = typeof mask === 'function' ? mask : () => mask;
        this._config = config;
    }

    masked(value = "") {
        value = (value + "").split("");
        let mask = this._mask(value).split("");
        const maskIt = reversed(this._maskIt.bind(this), this._config.reverse === true);
        return maskIt(mask, value).join("");
    }

    unmasked(value = "") {
        const mask = this._mask(value).split("");

        const index = value.split("").findIndex(c => !mask.includes(c));
        let result = index >= 0 ? value.slice(index) : "";

        if (this._config.placeholder)
            result = result.replaceAll(placeholder, "");

        mask
            .filter(isConstant)
            .forEach(m => {
                result = result.replaceAll(m, "");
            });

        return result;
    }

    _maskIt(mask = [], value = [], result = [], resetPos = null) {
        if (mask.length === 0 || value.length === 0)
            return [...result, ...this._suffix(mask)];
        const [maskChar, ...restMask] = mask;
        if (!isConstant(maskChar)) {
            const trans = translation[maskChar];
            const [valueChar, ...restValue] = value;
            if (valueChar.match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos)
                        resetPos = mask;
                    else if (mask.length === 1)
                        return this._maskIt(resetPos, restValue, [...result, valueChar], resetPos);
                }
                return this._maskIt(restMask, restValue, [...result, valueChar], resetPos);
            }
            if (trans.optional)
                return this._maskIt(restMask, value, result, resetPos);
            return this._maskIt(mask, restValue, result, resetPos);
        }
        return this._maskIt(restMask, value, [...result, maskChar], resetPos);
    }

    _suffix(mask = []) {
        let cte = "";
        if (this._config.placeholder)
            return mask.map(m => !isConstant(m) ? placeholder : m);
        if (this._config.hint && isConstant(mask[0]))
            [cte, ...mask] = mask;
        const constantTail = mask => {
            const lastMapChar = mask.findIndex(m => !isConstant(m) && (!this._config.default || (translation[m].optional || translation[m].recursive)));
            return mask.filter((m, i) => i < lastMapChar || lastMapChar === -1);
        };
        const suffix = reversed(constantTail, !this._config.reverse || !this._config.default);
        return [cte, ...suffix(mask)];
    }
}

function isConstant(maskChar = "") {
    return maskChar && !translation[maskChar];
}

module.exports = (mask, config) => new MaskImp(mask, config);
