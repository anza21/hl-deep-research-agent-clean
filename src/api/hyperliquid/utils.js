/**
 * Normalise the number of decimal places for a number
 * @param {Number} num - number to normalise
 * @param {"sz" | "px"} numType - type of number
 * @param {Number} szDecimals - from the asset metadata
 * @returns {Number} - normalised number
 */
const normaliseDecimals = (num, numType, szDecimals) => {
  num = parseFloat(num);
  // if number has no decimal places, it is valid
  if (num % 1 === 0) return num;

  if (numType === "sz") {
    const d = Math.pow(10, szDecimals);
    return Math.round((num + Number.EPSILON) * d) / d;
  }

  // if whole part takes up all sf, return whole part
  const whole = num.toString().split(".")[0];
  if (whole.length > 4) return parseFloat(whole);

  const fixed = num.toFixed(6 - szDecimals).replace(/0+$/, "");
  // if decimal part is 0, return whole part
  // if (fixed.endsWith(".")) return fixed.slice(0, -1);

  // number of decimal places is solved, now round to at most 5 sf
  return parseFloat(
    parseFloat(fixed).toPrecision(5).replace(/0+$/, "").replace(/\.$/, "")
  );
};

export { normaliseDecimals };
