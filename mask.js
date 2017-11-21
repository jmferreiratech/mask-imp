String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(
        new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")),
        (typeof(str2) === "string") ? str2.replace(/\$/g, "$$$$") : str2
    );
};

const translation = {
    "0": {pattern: /\d/},
    "#": {pattern: /\d/, recursive: true},
    "9": {pattern: /\d/, optional: true},
};
const placeholderChar = "_";

const reversed = (f, reverse = true) => (...params) => reverse ? f(...params.map(p => p.reverse())).reverse() : f(...params);

const MaskImpFactory = (mask, {reverse = false, defaultValue = false, hint = false, placeholder = false} = {}) => {
    const _mask = typeof mask === 'function' ? mask : () => mask;

    return {
        masked: (value = "") => {
            value = (value + "").split("");
            let mask = _mask(value).split("");
            const maskIt = reversed(_maskIt, reverse);
            return maskIt(mask, value).join("");
        },
        unmasked: (value = "") => {
            const mask = _mask(value).split("");

            const index = value.split("").findIndex(c => !mask.includes(c));
            let result = index >= 0 ? value.slice(index) : "";

            if (placeholder)
                result = result.replaceAll(placeholderChar, "");

            mask
                .filter(isConstant)
                .forEach(m => {
                    result = result.replaceAll(m, "");
                });

            return result;
        },
    };

    function _maskIt(mask = [], value = [], result = [], resetPos = null) {
        if (mask.length === 0 || value.length === 0)
            return [...result, ..._suffix(mask)];
        const [maskChar, ...restMask] = mask;
        if (!isConstant(maskChar)) {
            const trans = translation[maskChar];
            const [valueChar, ...restValue] = value;
            if (valueChar.match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos)
                        resetPos = mask;
                    else if (mask.length === 1)
                        return _maskIt(resetPos, restValue, [...result, valueChar], resetPos);
                }
                return _maskIt(restMask, restValue, [...result, valueChar], resetPos);
            }
            if (trans.optional)
                return _maskIt(restMask, value, result, resetPos);
            return _maskIt(mask, restValue, result, resetPos);
        }
        return _maskIt(restMask, value, [...result, maskChar], resetPos);
    }

    function _suffix(mask = []) {
        let cte = "";
        if (placeholder)
            return mask.map(m => !isConstant(m) ? placeholderChar : m);
        if (hint && isConstant(mask[0]))
            [cte, ...mask] = mask;
        const constantTail = mask => {
            const lastMapChar = mask.findIndex(m => !isConstant(m) && (!defaultValue || (translation[m].optional || translation[m].recursive)));
            return mask.filter((m, i) => i < lastMapChar || lastMapChar === -1);
        };
        const suffix = reversed(constantTail, !reverse || !defaultValue);
        return [cte, ...suffix(mask)];
    }
};

function isConstant(maskChar = "") {
    return maskChar && !translation[maskChar];
}

module.exports = MaskImpFactory;
