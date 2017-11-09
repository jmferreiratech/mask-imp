const translation = {
    "0": {pattern: /\d/},
};

class MaskImp {

    constructor(mask) {
        this._mask = mask;
    }

    masked(value) {
        value += "";
        value = value.split("").filter(c => Object.keys(this._mask).find(m => translation[m] && c.match(translation[m].pattern))).join("");
        const buf = [];
        let valueIndex = 0;
        for(let i = 0; i < this._mask.length && valueIndex < value.length; i++) {
            const trans = translation[this._mask[i]];
            if (trans) {
                if (value.charAt(valueIndex).match(trans.pattern)) {
                    buf.push(value.charAt(valueIndex));
                }
                valueIndex++;
            } else {
                buf.push(this._mask[i]);
            }
        }
        return buf.join("");
    }
}

module.exports = mask => new MaskImp(mask);
