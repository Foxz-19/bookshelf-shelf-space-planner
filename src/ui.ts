import { readableMinutes, readableTime } from './time';
import type { Plan, TimeFormat } from './types';
export function renderEmpty(target: HTMLElement): void { target.innerHTML = '<div class="empty"><span aria-hidden="true">☾</span><p>Set your times, then let the math do the dreaming.</p></div>'; }
export function renderPlan(target: HTMLElement, plan: Plan, format: TimeFormat): void {
  if (plan.warning) { target.innerHTML = `<div class="warning"><span aria-hidden="true">☾</span><h2>A tiny window</h2><p>${plan.warning}</p></div>`; return; }
  const best = plan.options.find(option => option.featured);
  const options = plan.options.map(option => `<article class="nap ${option.featured ? 'featured' : ''}"><div><p class="nap-kind">${option.kind}${option.featured ? '<span>best fit</span>' : ''}${option.alsoFullNap ? '<span>also your Full Nap</span>' : ''}</p><h3>${readableMinutes(option.minutes)}</h3><p>${option.description}</p></div><div class="alarm"><small>${option.tomorrow ? 'TOMORROW · ' : ''}SET ALARM FOR</small><strong>${readableTime(option.alarm, format)}</strong></div></article>`).join('');
  target.innerHTML = `<div class="result-title"><p class="eyebrow">Your window</p><h2 id="results-title">${readableMinutes(plan.available)} to rest</h2><p class="best-note">Best fit: <strong>${best?.kind}</strong> is a clear match for this window.</p></div><div class="nap-list">${options}</div>`;
}
