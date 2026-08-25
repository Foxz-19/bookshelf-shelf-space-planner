// @ts-check
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

/** @param {BlanketPlan} plan @param {Pick<PicnicInput, 'people' | 'gear'>} input */
export function renderPlan(plan, input) {
  document.querySelector('#feet').textContent = `${plan.width} × ${plan.length} ft`;
  document.querySelector('#meters').textContent = `${plan.metersWidth} × ${plan.metersLength} m`;
  document.querySelector('#comparison').textContent = plan.comparison;
  /** @type {HTMLElement} */
  const blanket = document.querySelector('#blanket');
  blanket.style.setProperty('--ratio', String(plan.width / plan.length));
  blanket.setAttribute('aria-label', `Blanket with ${input.people} ${input.people === 1 ? 'person' : 'people'} seated on it${input.gear ? ' and space for a cooler' : ''}`);
  /** @type {HTMLSpanElement} */
  const bag = document.querySelector('#bag');
  /** @type {HTMLElement} */
  const icons = document.querySelector('#people-icons');
  bag.hidden = !input.gear;
  renderPeople(icons, input.people);
}
