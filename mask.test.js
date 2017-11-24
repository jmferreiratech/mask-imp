const MaskImp = require("./mask");

test("basic cases", () => {
    const Masker = MaskImp("0");
    expect(Masker.masked("")).toBe("");
    expect(Masker.masked("0")).toBe("0");
    expect(Masker.masked("1")).toBe("1");
    expect(Masker.masked("a")).toBe("");
});

test("ignore non match", () => {
    const Masker = MaskImp("00");
    expect(Masker.masked("1abc2")).toBe("12");
    expect(Masker.masked("abc12")).toBe("12");
    expect(Masker.masked("1abc2")).toBe("12");
});

test("direct mask truncate after match", () => {
    const Masker = MaskImp("00");
    expect(Masker.masked("12345")).toBe("12");
});

test("direct mask", () => {
    const cnpj = "00.000.000/0000-00";
    const Masker = MaskImp(cnpj);
    expect(Masker.masked("2")).toBe("2");
    expect(Masker.masked("26")).toBe("26");
    expect(Masker.masked("263")).toBe("26.3");
    expect(Masker.masked("2636")).toBe("26.36");
    expect(Masker.masked("26366")).toBe("26.366");
    expect(Masker.masked("263668")).toBe("26.366.8");
    expect(Masker.masked("2636688")).toBe("26.366.88");
    expect(Masker.masked("26366883")).toBe("26.366.883");
    expect(Masker.masked("263668830")).toBe("26.366.883/0");
    expect(Masker.masked("2636688300")).toBe("26.366.883/00");
    expect(Masker.masked("26366883000")).toBe("26.366.883/000");
    expect(Masker.masked("263668830001")).toBe("26.366.883/0001");
    expect(Masker.masked("2636688300014")).toBe("26.366.883/0001-4");
    expect(Masker.masked("26366883000141")).toBe("26.366.883/0001-41");
});

test("mask can be reverse (right to left)", () => {
    const Masker = MaskImp("00.0", {reverse: true});
    expect(["2", "29", "29A", "293", "2934"].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.9", "29.3", "93.4"]);
});

test("reverse mask do not truncate after match", () => {
    const Masker = MaskImp("00.0", {reverse: true});
    expect(Masker.masked("12345")).toBe("34.5");
});

test("mask accepts number as input value", () => {
    const Masker = MaskImp("0.00");
    expect([2, 29, 293, 2934].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.93", "2.93"]);
    expect([2.0, 2.9, 2.93, 2.934].map(Masker.masked.bind(Masker)))
        .toEqual(["2", "2.9", "2.93", "2.93"]);
});

test("recursive reverse mask", () => {
    const number = "#.##0,00";
    const Masker = MaskImp(number, {reverse: true});
    expect(Masker.masked("1")).toBe("1");
    expect(Masker.masked("12")).toBe("12");
    expect(Masker.masked("123")).toBe("1,23");
    expect(Masker.masked("1234")).toBe("12,34");
    expect(Masker.masked("12345")).toBe("123,45");
    expect(Masker.masked("123456")).toBe("1.234,56");
    expect(Masker.masked("1234567")).toBe("12.345,67");
    expect(Masker.masked("12345678")).toBe("123.456,78");
    expect(Masker.masked("123456789")).toBe("1.234.567,89");
});

test("mask with optional digits", () => {
    const ip = "099.099.099.099";
    const Masker = MaskImp(ip);
    expect(Masker.masked("8.")).toBe("8.");
    expect(Masker.masked("8.8")).toBe("8.8");
    expect(Masker.masked("88")).toBe("88");
    expect(Masker.masked("8.8.8.8")).toBe("8.8.8.8");
    expect(Masker.masked("16.16.16.16")).toBe("16.16.16.16");
    expect(Masker.masked("255.255.255.255")).toBe("255.255.255.255");
    expect(Masker.masked("192.168.0.1")).toBe("192.168.0.1");
    expect(Masker.masked("000000000000")).toBe("000.000.000.000");
    expect(Masker.masked("8A8")).toBe("88");
    expect(Masker.masked("8A8")).toBe("88");
});

test("constant mask", () => {
    const Masker = MaskImp("ABC123");
    expect(Masker.masked("")).toBe("ABC123");
    expect(Masker.masked("21")).toBe("ABC123");
    expect(Masker.masked("448")).toBe("ABC123");
    expect(Masker.masked("1824")).toBe("ABC123");
});

test("direct mask with suffix", () => {
    const money = "0,00 €";
    const Masker = MaskImp(money);
    expect(Masker.masked("")).toBe(" €");
    expect(Masker.masked("1")).toBe("1 €");
    expect(Masker.masked("12")).toBe("1,2 €");
    expect(Masker.masked("123")).toBe("1,23 €");
    expect(Masker.masked("1234")).toBe("1,23 €");
});

test("direct mask with prefix", () => {
    const money = "R$ 0,00";
    const Masker = MaskImp(money);
    expect(Masker.masked("")).toBe("R$ ");
    expect(Masker.masked("1")).toBe("R$ 1");
    expect(Masker.masked("12")).toBe("R$ 1,2");
    expect(Masker.masked("123")).toBe("R$ 1,23");
    expect(Masker.masked("1234")).toBe("R$ 1,23");
});

test("reverse mask with suffix", () => {
    const money = "0,00 €";
    const Masker = MaskImp(money, {reverse: true});
    expect(Masker.masked("")).toBe(" €");
    expect(Masker.masked("1")).toBe("1 €");
    expect(Masker.masked("12")).toBe("12 €");
    expect(Masker.masked("123")).toBe("1,23 €");
    expect(Masker.masked("1234")).toBe("2,34 €");
});

test("reverse recursive mask with default value", () => {
    const money = "#.##0,00";
    const Masker = MaskImp(money, {defaultValue: true, reverse: true});
    expect(Masker.masked("")).toBe("0,00");
    expect(Masker.masked("1")).toBe("0,01");
    expect(Masker.masked("12")).toBe("0,12");
    expect(Masker.masked("123")).toBe("1,23");
    expect(Masker.masked("1234")).toBe("12,34");
});

test("functional mask", () => {
    const phoneNumber = val => val.length <= 8 ? "0000-0000" : "9 0000-0000";
    const Masker = MaskImp(phoneNumber);
    expect(Masker.masked("9")).toBe("9");
    expect(Masker.masked("99")).toBe("99");
    expect(Masker.masked("997")).toBe("997");
    expect(Masker.masked("9972")).toBe("9972");
    expect(Masker.masked("99725")).toBe("9972-5");
    expect(Masker.masked("997253")).toBe("9972-53");
    expect(Masker.masked("9972534")).toBe("9972-534");
    expect(Masker.masked("99725348")).toBe("9972-5348");
    expect(Masker.masked("997253486")).toBe("9 9725-3486");
});

test("direct unmask", () => {
    const cpf = "000.000.000-00";
    const Masker = MaskImp(cpf);
    expect(Masker.unmasked(Masker.masked("6"))).toBe("6");
    expect(Masker.unmasked(Masker.masked("66"))).toBe("66");
    expect(Masker.unmasked(Masker.masked("668"))).toBe("668");
    expect(Masker.unmasked(Masker.masked("6685"))).toBe("6685");
    expect(Masker.unmasked(Masker.masked("66850"))).toBe("66850");
    expect(Masker.unmasked(Masker.masked("668501"))).toBe("668501");
    expect(Masker.unmasked(Masker.masked("668501."))).toBe("668501");
    expect(Masker.unmasked(Masker.masked("668501.7"))).toBe("6685017");
    expect(Masker.unmasked(Masker.masked("668501.73"))).toBe("66850173");
    expect(Masker.unmasked(Masker.masked("668501.738"))).toBe("668501738");
    expect(Masker.unmasked(Masker.masked("668501.7385"))).toBe("6685017385");
    expect(Masker.unmasked(Masker.masked("668501.73853"))).toBe("66850173853");
});

test("reverse recursive unmask with default value", () => {
    const money = "#.##0,00";
    const Masker = MaskImp(money, {defaultValue: true, reverse: true});
    expect(Masker.unmasked(Masker.masked(""))).toBe("");
    expect(Masker.unmasked(Masker.masked("1"))).toBe("1");
    expect(Masker.unmasked(Masker.masked("10"))).toBe("10");
    expect(Masker.unmasked(Masker.masked("103"))).toBe("103");
    expect(Masker.unmasked(Masker.masked("1034"))).toBe("1034");
});

test("reverse fixed unmask with suffix", () => {
    const money = "0,00 €";
    const Masker = MaskImp(money, {reverse: true});
    expect(Masker.unmasked(Masker.masked(""))).toBe("");
    expect(Masker.unmasked(Masker.masked("1"))).toBe("1");
    expect(Masker.unmasked(Masker.masked("12"))).toBe("12");
    expect(Masker.unmasked(Masker.masked("123"))).toBe("123");
    expect(Masker.unmasked(Masker.masked("1234"))).toBe("234");
});

test("direct fixed unmask with prefix", () => {
    const money = "R$ 0,00";
    const Masker = MaskImp(money);
    expect(Masker.unmasked(Masker.masked(""))).toBe("");
    expect(Masker.unmasked(Masker.masked("1"))).toBe("1");
    expect(Masker.unmasked(Masker.masked("10"))).toBe("10");
    expect(Masker.unmasked(Masker.masked("103"))).toBe("103");
    expect(Masker.unmasked(Masker.masked("1034"))).toBe("103");
});

test("direct mask with prefix that shows next constant", () => {
    const money = "R$ 0,00";
    const Masker = MaskImp(money, {hint: true});
    expect(Masker.masked("")).toBe("R$ ");
    expect(Masker.masked("1")).toBe("R$ 1,");
    expect(Masker.masked("123")).toBe("R$ 1,23");
});

test("direct mask with fixed placeholder", () => {
    const cpf = "000.000.000-00";
    const Masker = MaskImp(cpf, {placeholder: true});
    expect(Masker.masked("")).toBe("___.___.___-__");
    expect(Masker.masked("6")).toBe("6__.___.___-__");
    expect(Masker.masked("66")).toBe("66_.___.___-__");
    expect(Masker.masked("668")).toBe("668.___.___-__");
    expect(Masker.masked("6685")).toBe("668.5__.___-__");
    expect(Masker.masked("66853")).toBe("668.53_.___-__");
    expect(Masker.masked("668533")).toBe("668.533.___-__");
    expect(Masker.masked("6685333")).toBe("668.533.3__-__");
    expect(Masker.masked("66853335")).toBe("668.533.35_-__");
    expect(Masker.masked("668533350")).toBe("668.533.350-__");
    expect(Masker.masked("6685333502")).toBe("668.533.350-2_");
    expect(Masker.masked("66853335023")).toBe("668.533.350-23");
});

test("direct unmask with fixed placeholder", () => {
    const cpf = "000.000.000-00";
    const Masker = MaskImp(cpf, {placeholder: true});
    expect(Masker.unmasked(Masker.masked(""))).toBe("");
    expect(Masker.unmasked(Masker.masked("6"))).toBe("6");
    expect(Masker.unmasked(Masker.masked("66"))).toBe("66");
    expect(Masker.unmasked(Masker.masked("668"))).toBe("668");
    expect(Masker.unmasked(Masker.masked("6685"))).toBe("6685");
    expect(Masker.unmasked(Masker.masked("66853"))).toBe("66853");
    expect(Masker.unmasked(Masker.masked("668533"))).toBe("668533");
    expect(Masker.unmasked(Masker.masked("6685333"))).toBe("6685333");
    expect(Masker.unmasked(Masker.masked("66853335"))).toBe("66853335");
    expect(Masker.unmasked(Masker.masked("668533350"))).toBe("668533350");
    expect(Masker.unmasked(Masker.masked("6685333502"))).toBe("6685333502");
    expect(Masker.unmasked(Masker.masked("66853335023"))).toBe("66853335023");
});

test("direct mask with alphabetic characters", () => {
    const issn = "0000-000S";
    const Masker = MaskImp(issn);
    expect(Masker.masked("24345618X")).toBe("2434-561X");
});

test("mask with extension", () => {
    const hexa = "HHHH";
    const Masker = MaskImp(hexa, {dict: {"H": {pattern: /[\da-fA-F]/}}});
    expect(Masker.masked("0FG9Ah")).toBe("0F9A");
});
