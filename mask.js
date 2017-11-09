const translation = {
    "0": {pattern: /\d/},
};

class MaskImp {

    constructor(mask, config = {}) {
        this._mask = mask;
        this._config = config;
    }

    masked(value) {
        value += "";
        value = value.split("").filter(c => Object.keys(this._mask).find(m => translation[m] && c.match(translation[m].pattern))).join("");
        const buf = [];
        let mask = this._mask + "";
        if (this._config.reverse) {
            mask = mask.split("").reverse().join("");
            value = value.split("").reverse().join("");
        }

        let valueIndex = 0;
        for(let i = 0; i < mask.length && valueIndex < value.length; i++) {
            const trans = translation[mask[i]];
            if (trans) {
                if (value.charAt(valueIndex).match(trans.pattern)) {
                    buf.push(value.charAt(valueIndex));
                }
                valueIndex++;
            } else {
                buf.push(mask[i]);
            }
        }
        return this._config.reverse ? buf.reverse().join("") : buf.join("");
    }
}

module.exports = (mask, config) => new MaskImp(mask, config);
