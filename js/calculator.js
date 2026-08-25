// @ts-check
/** @typedef {import('./types.js').Style} Style */
/** @typedef {import('./types.js').PicnicInput} PicnicInput */
/** @typedef {import('./types.js').BlanketPlan} BlanketPlan */

const styles = { cozy: 9, comfortable: 12, sprawled: 16 };
/** @type {Array<[number, string]>} */
const comparisons = [
  [19, 'A compact solo blanket.'],
  [20, 'About the size of a twin bed.'],
  [38, 'About the size of a full bed.'],
  [55, 'About the size of a queen bed.'],
  [76, 'About the size of a king bed.'],
  [Infinity, 'Bigger than a king bed — bring the whole crew.'],
];

/** Calculate a practical rectangular blanket, rounded to whole feet. @param {PicnicInput} input @returns {BlanketPlan} */
export function calculateBlanket({ people, style, gear }) {
  const safePeople = Number.isFinite(people) ? Math.min(20, Math.max(1, Math.round(people))) : 1;
  const area = safePeople * (styles[style] || styles.comfortable) + (gear ? 9 : 0);
  const sideA = Math.ceil(Math.sqrt(area * 0.88));
  const sideB = Math.ceil(area / sideA);
  const width = Math.min(sideA, sideB);
  const length = Math.max(sideA, sideB);
  const comparison = comparisons.find(([max]) => width * length <= max)[1];
  return { width, length, metersWidth: (width * 0.3048).toFixed(1), metersLength: (length * 0.3048).toFixed(1), comparison };
}
