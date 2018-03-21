const defaultTranslation = {
    "0": {pattern: /\d/},
    "#": {pattern: /\d/, recursive: true},
    "9": {pattern: /\d/, optional: true},
    "S": {pattern: /[a-zA-Z]/},
    "~": {pattern: /[+-]/, fallback: "+"},
    "^": {pattern: /[+-]/, optional: true},
    "=": {pattern: /[-]/, optional: true},
};
const placeholderChar = "_";
const escapeChar = "!";

const reversed = (f, reverse = true) => (...params) => reverse ? f(...params.map(p => p.reverse())).reverse() : f(...params);

const MaskImpFactory = (mask, {reverse = false, defaultValue = false, hint = false, placeholder = false, dict = {}} = {}) => {
    const _mask = typeof mask === 'function' ? mask : () => mask;
    const translation = Object.assign({}, defaultTranslation, dict);

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
                result = replaceAll(result, placeholderChar, "");

            mask
                .filter(isConstant)
                .forEach(m => {
                    result = replaceAll(result, m, "");
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
            if (trans.recursive) {
                return _maskIt(withoutRecursiveChunk(mask), value, result, resetPos);
            }
            if (trans.fallback) {
                return _maskIt(restMask, value, [...result, trans.fallback], resetPos);
            }
            return _maskIt(mask, restValue, result, resetPos);
        }
        if (maskChar === escapeChar) {
            const [head, ...rest] = restMask;
            return _maskIt(rest, value, [...result, head], resetPos);
        }
        if (resetPos && translation[resetPos[0]].optional && maskChar !== valueChar)
            return _maskIt(resetPos, restValue, result, null);
        return _maskIt(restMask, value, [...result, maskChar], resetPos);
    }

    function breakAffix(rawMask) {
        let startMaskIndex = rawMask.findIndex(m => !isConstant(m) || m === escapeChar);
        startMaskIndex = startMaskIndex > -1 ? startMaskIndex : rawMask.length;
        let endMaskIndex = rawMask.length - rawMask.slice().reverse().findIndex(m => !isConstant(m) || m === escapeChar);
        endMaskIndex = Math.min(endMaskIndex, rawMask.length);
        return {
            prefix: rawMask.slice(0, startMaskIndex),
            mask: rawMask.slice(startMaskIndex, endMaskIndex),
            suffix: rawMask.slice(endMaskIndex),
        };
    }

    function _suffix(mask = []) {
        if (placeholder)
            return mask.map(m => !isConstant(m) ? placeholderChar : m);
        mask = withoutRecursiveChunk(mask);
        if (defaultValue) {
            const lastMapChar = mask.findIndex(m => !isConstant(m) && (translation[m].optional || translation[m].recursive));
            return mask.filter((m, i) => i < lastMapChar || lastMapChar === -1);
        }
        if (hint && isConstant(mask[0]))
            return [mask[0]];
        if (!isConstant(mask[0]) && translation[mask[0]].fallback)
            return [translation[mask[0]].fallback];
        return [];
    }

    function withoutRecursiveChunk(mask) {
        let firstIndex = mask.findIndex(m => !isConstant(m) && translation[m].recursive);
        if (firstIndex > -1) {
            const lastIndex = mask.length - mask.slice().reverse().findIndex(m => !isConstant(m) && translation[m].recursive);
            if (firstIndex === lastIndex - 1)
                firstIndex = 0;
            if (lastIndex <= mask.length)
                return [...mask.slice(0, firstIndex), ...mask.slice(lastIndex)];
        }
        return mask;
    }

    function isConstant(maskChar = "") {
        return !translation[maskChar];
    }
};

function replaceAll(string, substr, newSubstr, ignore) {
    return string.replace(
        new RegExp(substr.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")),
        (typeof(newSubstr) === "string") ? newSubstr.replace(/\$/g, "$$$$") : newSubstr
    );
}

module.exports = MaskImpFactory;
