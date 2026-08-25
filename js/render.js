// @ts-check
import { requiredElement } from './dom.js';
/** @typedef {import('./types.js').BlanketPlan} BlanketPlan */
/** @typedef {import('./types.js').PicnicInput} PicnicInput */

/** @param {HTMLElement} target @param {number} people */
export function renderPeople(target, people) {
  target.replaceChildren(...Array.from({ length: people }, (_, index) => {
    const icon = document.createElement('span');
    icon.className = 'person'; icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--i', String(index));
    return icon;
  }));
}

/** @param {BlanketPlan} plan @param {PicnicInput} input */
export function renderPlan(plan, input) {
  requiredElement('#feet', HTMLElement).textContent = `${plan.width} × ${plan.length} ft`;
  requiredElement('#meters', HTMLElement).textContent = `${plan.metersWidth} × ${plan.metersLength} m`;
  requiredElement('#comparison', HTMLElement).textContent = plan.comparison;
  requiredElement('#plan-details', HTMLElement).textContent = `${input.people} ${input.people === 1 ? 'person' : 'people'} · ${input.style[0].toUpperCase() + input.style.slice(1)} · ${input.gear ? 'Cooler or bag' : 'No extra gear'}`;
  requiredElement('#shop-tip', HTMLElement).textContent = `Look for at least ${plan.width} × ${plan.length} ft. Closest common choice: ${plan.shopSize}.`;
  const copyButton = requiredElement('#copy-plan', HTMLButtonElement);
  copyButton.textContent = `Copy ${plan.width} × ${plan.length} ft plan`;
  copyButton.dataset.plan = `${plan.width} × ${plan.length} ft (${plan.metersWidth} × ${plan.metersLength} m) for ${input.people} ${input.people === 1 ? 'person' : 'people'} — ${input.style}${input.gear ? ', with cooler or bag space' : ''}.`;
  const blanket = requiredElement('#blanket', HTMLElement);
  blanket.style.setProperty('--ratio', String(plan.width / plan.length));
  blanket.setAttribute('aria-label', `Blanket with ${input.people} ${input.people === 1 ? 'person' : 'people'} seated on it${input.gear ? ' and space for a cooler' : ''}`);
  const bag = requiredElement('#bag', HTMLSpanElement);
  const icons = requiredElement('#people-icons', HTMLElement);
  bag.hidden = !input.gear;
  renderPeople(icons, input.people);
}
