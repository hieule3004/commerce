import * as mathjs from 'mathjs';


/** Reimplementation of https://v3.yarnpkg.com/package/convert.
 * For list of units, refer to https://mathjs.org/docs/datatypes/units.html#reference.
 * */
const convert = (value: number, fromUnit: string) => ({
  to: (toUnit: string) => mathjs.unit(value, fromUnit).toNumber(toUnit),
});

export { convert };