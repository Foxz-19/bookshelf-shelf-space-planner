import './styles.css';
import { DAYS, type SleepState } from './types';
import { clampHours, cleanGoal } from './calculations';
import { renderDays, renderSummary, showNotice } from './ui';

const initialState = (goal = 8): SleepState => ({ goal, hours: Object.fromEntries(DAYS.map(day => [day, 0])) as SleepState['hours'] });
let state = initialState();
const goal = document.getElementById('goal') as HTMLInputElement;
const dialog = document.getElementById('confirm') as HTMLDialogElement;
const goalError = document.getElementById('goal-error') as HTMLParagraphElement;
function render(): void { renderDays(state, (day, value) => { state.hours[day] = clampHours(value); render(); }); renderSummary(state); }
goal.addEventListener('input', () => {
  const entered = goal.valueAsNumber;
  if (!Number.isFinite(entered)) { state.goal = 0; goalError.textContent = 'Enter a sleep goal from 0 to 24 hours.'; render(); return; }
  const validGoal = cleanGoal(entered);
  goal.value = String(validGoal);
  goalError.textContent = validGoal !== entered ? 'Sleep goal was limited to 24 hours.' : '';
  state.goal = validGoal;
  render();
});
document.getElementById('reset')!.addEventListener('click', () => dialog.showModal());
document.addEventListener('keydown', event => {
  const isTyping = event.target instanceof Element && event.target.matches('input, textarea, select, [contenteditable="true"]');
  if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping && !dialog.open) dialog.showModal();
});
dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm') { state = initialState(0); goal.value = '0'; goalError.textContent = ''; render(); showNotice('Week reset. All inputs are now zero.'); } });
render();
