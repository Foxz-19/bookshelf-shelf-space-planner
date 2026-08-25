import { calculateBlanket } from './calculator.js';
import { requiredElement } from './dom.js';
import { renderPlan } from './render.js';

/** @typedef {import('./types.js').PicnicInput} PicnicInput */

const people = requiredElement('#people', HTMLInputElement);
const gear = requiredElement('#gear', HTMLInputElement);
const status = requiredElement('#status', HTMLElement);
const copyButton = requiredElement('#copy-plan', HTMLButtonElement);
const copyStatus = requiredElement('#copy-status', HTMLElement);

/** @returns {PicnicInput} */
function readInput() {
  const raw = Number(people.value);
  const count = Math.min(20, Math.max(1, Number.isFinite(raw) ? Math.round(raw) : 1));
  if (String(count) !== people.value) people.value = String(count);
  const style = requiredElement('input[name="style"]:checked', HTMLInputElement);
  return { people: count, style: /** @type {import('./types.js').Style} */ (style.value), gear: gear.checked };
}
function update() {
  const input = readInput(); const plan = calculateBlanket(input);
  renderPlan(plan, input);
  status.textContent = `Updated: ${plan.width} by ${plan.length} feet, ${plan.comparison}`;
}
/** @type {NodeListOf<HTMLButtonElement>} */
const stepButtons = document.querySelectorAll('[data-step]');
stepButtons.forEach(button => button.addEventListener('click', () => {
  people.value = String(Number(people.value || 1) + Number(button.dataset.step)); update();
}));
document.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.plan ?? '');
    copyStatus.textContent = 'Plan copied — send it to the group.';
  } catch {
    copyStatus.textContent = 'Couldn’t copy the plan. Select the recommendation to share it.';
  }
});
update();
