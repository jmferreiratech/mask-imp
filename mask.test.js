const MaskImp = require("./mask");

test("match to itself", () => {
    const Masker = MaskImp("0");
    expect(["0", "1"].map(Masker.masked.bind(Masker)))
        .toEqual(["0", "1"]);
});

test("unmatch to empty", () => {
    const Masker = MaskImp("0");
    expect(["a"].map(Masker.masked.bind(Masker)))
        .toEqual([""]);
});

test("ignore after match", () => {
    const Masker = MaskImp("0");
    expect(["1222"].map(Masker.masked.bind(Masker)))
        .toEqual(["1"]);
});

test("ignore before match", () => {
    const Masker = MaskImp("0");
    expect(["a1"].map(Masker.masked.bind(Masker)))
        .toEqual(["1"]);
});

test("ignore intra match", () => {
    const Masker = MaskImp("00");
    expect(["1a2"].map(Masker.masked.bind(Masker)))
        .toEqual(["12"]);
});

test("direct mask", () => {
    const Masker = MaskImp("00.0");
    expect(["2", "29", "293", "2934"].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "29", "29.3", "29.3"]);
});

test("reverse mask", () => {
    const Masker = MaskImp("00.0", {reverse: true});
    expect(["2", "29", "29A", "293", "2934"].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.9", "29.3", "93.4"]);
});

test("mask integer", () => {
    const Masker = MaskImp("0.00");
    expect([2, 29, 293, 2934].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.93", "2.93"]);
});

test("mask float", () => {
    const Masker = MaskImp("0.00");
    expect([2.0, 2.9, 2.93, 2.934].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.93", "2.93"]);
});
