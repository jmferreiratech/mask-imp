"use strict";

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultTranslation = {
    "0": { pattern: /\d/ },
    "#": { pattern: /\d/, recursive: true },
    "9": { pattern: /\d/, optional: true },
    "S": { pattern: /[a-zA-Z]/ },
    "~": { pattern: /[+-]/, fallback: "+" },
    "^": { pattern: /[+-]/, optional: true },
    "=": { pattern: /[-]/, optional: true }
};
var placeholderChar = "_";
var escapeChar = "!";

var reversed = function reversed(f) {
    var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return function () {
        for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
            params[_key] = arguments[_key];
        }

        return reverse ? f.apply(undefined, _toConsumableArray(params.map(function (p) {
            return p.reverse();
        }))).reverse() : f.apply(undefined, params);
    };
};

var MaskImpFactory = function MaskImpFactory(mask) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$reverse = _ref.reverse,
        reverse = _ref$reverse === undefined ? false : _ref$reverse,
        _ref$defaultValue = _ref.defaultValue,
        defaultValue = _ref$defaultValue === undefined ? false : _ref$defaultValue,
        _ref$hint = _ref.hint,
        hint = _ref$hint === undefined ? false : _ref$hint,
        _ref$placeholder = _ref.placeholder,
        placeholder = _ref$placeholder === undefined ? false : _ref$placeholder,
        _ref$dict = _ref.dict,
        dict = _ref$dict === undefined ? {} : _ref$dict;

    var _mask = typeof mask === 'function' ? mask : function () {
        return mask;
    };
    var translation = Object.assign({}, defaultTranslation, dict);

    return {
        masked: function masked() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            value = (value + "").split("");

            var _breakAffix = breakAffix(_mask(value).split("")),
                prefix = _breakAffix.prefix,
                mask = _breakAffix.mask,
                suffix = _breakAffix.suffix;

            var maskIt = reversed(_maskIt, reverse);
            return [].concat(_toConsumableArray(prefix), _toConsumableArray(maskIt(mask, value)), _toConsumableArray(suffix)).join("");
        },
        unmasked: function unmasked() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            var mask = _mask(value).split("");

            var index = value.split("").findIndex(function (c) {
                return !mask.includes(c);
            });
            var result = index >= 0 ? value.slice(index) : "";

            if (placeholder) result = replaceAll(result, placeholderChar, "");

            mask.filter(isConstant).forEach(function (m) {
                result = replaceAll(result, m, "");
            });

            return result;
        }
    };

    function _maskIt() {
        var mask = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var resetPos = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        if (mask.length === 0 || value.length === 0) return [].concat(_toConsumableArray(result), _toConsumableArray(_suffix(mask)));

        var _mask2 = _toArray(mask),
            maskChar = _mask2[0],
            restMask = _mask2.slice(1);

        var _value = _toArray(value),
            valueChar = _value[0],
            restValue = _value.slice(1);

        if (!isConstant(maskChar)) {
            var trans = translation[maskChar];
            if (valueChar.match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos) resetPos = mask;else if (mask.length === 1) return _maskIt(resetPos, restValue, [].concat(_toConsumableArray(result), [valueChar]), null);
                }
                return _maskIt(restMask, restValue, [].concat(_toConsumableArray(result), [valueChar]), resetPos);
            }
            if (trans.optional) {
                if (!resetPos) resetPos = mask;
                return _maskIt(restMask, value, result, resetPos);
            }
            if (trans.recursive) {
                return _maskIt(withoutRecursiveChunk(mask), value, result, resetPos);
            }
            if (trans.fallback) {
                return _maskIt(restMask, value, [].concat(_toConsumableArray(result), [trans.fallback]), resetPos);
            }
            return _maskIt(mask, restValue, result, resetPos);
        }
        if (maskChar === escapeChar) {
            var _restMask = _toArray(restMask),
                head = _restMask[0],
                rest = _restMask.slice(1);

            return _maskIt(rest, value, [].concat(_toConsumableArray(result), [head]), resetPos);
        }
        if (resetPos && translation[resetPos[0]].optional && maskChar !== valueChar) return _maskIt(resetPos, restValue, result, null);
        return _maskIt(restMask, value, [].concat(_toConsumableArray(result), [maskChar]), resetPos);
    }

    function breakAffix(rawMask) {
        var startMaskIndex = rawMask.findIndex(function (m) {
            return !isConstant(m) || m === escapeChar;
        });
        startMaskIndex = startMaskIndex > -1 ? startMaskIndex : rawMask.length;
        var endMaskIndex = rawMask.length - rawMask.slice().reverse().findIndex(function (m) {
            return !isConstant(m) || m === escapeChar;
        });
        endMaskIndex = Math.min(endMaskIndex, rawMask.length);
        return {
            prefix: rawMask.slice(0, startMaskIndex),
            mask: rawMask.slice(startMaskIndex, endMaskIndex),
            suffix: rawMask.slice(endMaskIndex)
        };
    }

    function _suffix() {
        var mask = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if (placeholder) return mask.map(function (m) {
            return !isConstant(m) ? placeholderChar : m;
        });
        mask = withoutRecursiveChunk(mask);
        if (defaultValue) {
            var lastMapChar = mask.findIndex(function (m) {
                return !isConstant(m) && (translation[m].optional || translation[m].recursive);
            });
            return mask.filter(function (m, i) {
                return i < lastMapChar || lastMapChar === -1;
            });
        }
        if (hint && isConstant(mask[0])) return [mask[0]];
        if (!isConstant(mask[0]) && translation[mask[0]].fallback) return [translation[mask[0]].fallback];
        return [];
    }

    function withoutRecursiveChunk(mask) {
        var firstIndex = mask.findIndex(function (m) {
            return !isConstant(m) && translation[m].recursive;
        });
        if (firstIndex > -1) {
            var lastIndex = mask.length - mask.slice().reverse().findIndex(function (m) {
                return !isConstant(m) && translation[m].recursive;
            });
            if (firstIndex === lastIndex - 1) firstIndex = 0;
            if (lastIndex <= mask.length) return [].concat(_toConsumableArray(mask.slice(0, firstIndex)), _toConsumableArray(mask.slice(lastIndex)));
        }
        return mask;
    }

    function isConstant() {
        var maskChar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

        return !translation[maskChar];
    }
};

function replaceAll(string, substr, newSubstr, ignore) {
    return string.replace(new RegExp(substr.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof newSubstr === "string" ? newSubstr.replace(/\$/g, "$$$$") : newSubstr);
}

module.exports = MaskImpFactory;