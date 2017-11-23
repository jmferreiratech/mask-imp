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

const breakAffix = rawMask => {
    let startMaskIndex = rawMask.findIndex(m => !isConstant(m));
    startMaskIndex = startMaskIndex > -1 ? startMaskIndex : rawMask.length;
    let endMaskIndex = rawMask.length - rawMask.slice().reverse().findIndex(m => !isConstant(m));
    endMaskIndex = endMaskIndex <= rawMask.length ? endMaskIndex : rawMask.length;

    return {
        prefix: rawMask.slice(0, startMaskIndex),
        mask: rawMask.slice(startMaskIndex, endMaskIndex),
        suffix: rawMask.slice(endMaskIndex),
    };
};

const MaskImpFactory = (mask, {reverse = false, defaultValue = false, hint = false, placeholder = false} = {}) => {
    const _mask = typeof mask === 'function' ? mask : () => mask;

    return {
        masked: (value = "") => {
            value = (value + "").split("");
            const {prefix, mask, suffix} = breakAffix(_mask(value).split(""));
            const maskIt = reversed(_maskIt, reverse);
            return [...prefix, ...maskIt(mask, value), ...suffix].join("");
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
        const [valueChar, ...restValue] = value;
        if (!isConstant(maskChar)) {
            const trans = translation[maskChar];
            if (valueChar.match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos)
                        resetPos = mask;
                    else if (mask.length === 1)
                        return _maskIt(resetPos, restValue, [...result, valueChar], null);
                }
                return _maskIt(restMask, restValue, [...result, valueChar], resetPos);
            }
            if (trans.optional) {
                if (!resetPos)
                    resetPos = mask;
                return _maskIt(restMask, value, result, resetPos);
            }
            return _maskIt(mask, restValue, result, resetPos);
        }
        if (resetPos && translation[resetPos[0]].optional && maskChar !== valueChar)
            return _maskIt(resetPos, restValue, result, null);
        return _maskIt(restMask, value, [...result, maskChar], resetPos);
    }

    function _suffix(mask = []) {
        if (placeholder)
            return mask.map(m => !isConstant(m) ? placeholderChar : m);
        if (defaultValue) {
            const lastMapChar = mask.findIndex(m => !isConstant(m) && (translation[m].optional || translation[m].recursive));
            return mask.filter((m, i) => i < lastMapChar || lastMapChar === -1);
        }
        if (hint && isConstant(mask[0]))
            return [mask[0]];
        return [];
    }
};

function isConstant(maskChar = "") {
    return !translation[maskChar];
}

module.exports = MaskImpFactory;
