import { createPlan } from './planner';
import { notify } from './notify';
import { parseTime, readableMinutes } from './time';
import { renderEmpty, renderPlan } from './ui';
import type { Plan, TimeFormat } from './types';
import './styles.css';
const form = document.querySelector<HTMLFormElement>('#planner-form')!;
const now = document.querySelector<HTMLInputElement>('#now')!;
const wake = document.querySelector<HTMLInputElement>('#wake')!;
const error = document.querySelector<HTMLElement>('#form-error')!;
const results = document.querySelector<HTMLElement>('#results')!;
const windowText = document.querySelector<HTMLElement>('#window')!;
const planButton = document.querySelector<HTMLButtonElement>('#plan')!;
const refreshButton = document.querySelector<HTMLButtonElement>('#refresh-now')!;
const timeFormat = document.querySelector<HTMLSelectElement>('#time-format')!;
const clockStatus = document.querySelector<HTMLElement>('#clock-status')!;
let activePlan: Plan | null = null;
const pad = (n: number) => String(n).padStart(2, '0');
const date = new Date(); now.value = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
function setCurrentTime(): void { const current = new Date(); now.value = `${pad(current.getHours())}:${pad(current.getMinutes())}`; clockStatus.textContent = 'Current time refreshed'; onTimeInput(); }
function clearError(): void { error.textContent = ''; }
function updateWindow(): void { const a = parseTime(now.value), b = parseTime(wake.value); if (a !== null && b !== null) { const tomorrow = b < a; windowText.textContent = `${readableMinutes(tomorrow ? b - a + 1440 : b - a)} available${tomorrow ? ' · tomorrow' : ''}`; } }
function selectedFormat(): TimeFormat { return timeFormat.value === '24h' ? '24h' : '12h'; }
function setPlanning(active: boolean): void {
  planButton.disabled = active; planButton.textContent = active ? 'Finding your nap…' : 'Find my perfect nap ↗'; results.setAttribute('aria-busy', String(active));
}
function onTimeInput(): void { clearError(); updateWindow(); if (activePlan) { activePlan = null; renderEmpty(results); } }
function handleSubmit(event: SubmitEvent): void {
  event.preventDefault(); clearError(); const start = parseTime(now.value), end = parseTime(wake.value);
  if (start === null || end === null) { error.textContent = 'Please enter both times so we can plan your rest.'; notify('Your plan needs two times.'); return; }
  setPlanning(true);
  requestAnimationFrame(() => {
    try { activePlan = createPlan(start, end); renderPlan(results, activePlan, selectedFormat()); results.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }); }
    catch { error.textContent = 'We could not make that plan. Please try your times again.'; notify('Something went wrong while planning.'); }
    finally { setPlanning(false); }
  });
}
now.addEventListener('input', onTimeInput);
wake.addEventListener('input', onTimeInput);
refreshButton.addEventListener('click', setCurrentTime);
timeFormat.addEventListener('change', () => { if (activePlan) renderPlan(results, activePlan, selectedFormat()); });
form.addEventListener('submit', handleSubmit);
