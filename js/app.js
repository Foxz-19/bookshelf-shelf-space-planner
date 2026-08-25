import { calculateBlanket } from './calculator.js';
import { renderPlan } from './render.js';

/** @typedef {import('./types.js').PicnicInput} PicnicInput */

/** @type {HTMLInputElement} */
const people = document.querySelector('#people');
/** @type {HTMLInputElement} */
const gear = document.querySelector('#gear');
/** @type {HTMLElement} */
const status = document.querySelector('#status');

/** @returns {PicnicInput} */
function readInput() {
  const raw = Number(people.value);
  const count = Math.min(20, Math.max(1, Number.isFinite(raw) ? Math.round(raw) : 1));
  if (String(count) !== people.value) people.value = String(count);
  /** @type {HTMLInputElement} */
  const style = document.querySelector('input[name="style"]:checked');
  return { people: count, style: /** @type {import('./types.js').Style} */ (style.value), gear: gear.checked };
}
function update() {
  const input = readInput(); const plan = calculateBlanket(input);
  renderPlan(plan, input);
  status.textContent = `Updated: ${plan.width} by ${plan.length} feet, ${plan.comparison}`;
}
document.querySelectorAll('[data-step]').forEach(/** @param {HTMLButtonElement} button */ button => button.addEventListener('click', () => {
  people.value = String(Number(people.value || 1) + Number(button.dataset.step)); update();
}));
document.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
update();
