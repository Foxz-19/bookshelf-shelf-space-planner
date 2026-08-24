import { DAYS, type SleepState } from './types';
import { dayDifference, totals, formatHours, balanceMessage } from './calculations';

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const sign = (value: number) => value > 0 ? '+' : value < 0 ? '−' : '±';

export function renderDays(state: SleepState, onChange: (day: typeof DAYS[number], value: number) => void): void {
  const container = byId<HTMLDivElement>('days');
  container.replaceChildren(...DAYS.map((day, index) => {
    const diff = dayDifference(state, day), row = document.createElement('div');
    row.className = 'day'; row.innerHTML = `<label for="sleep-${index}">${day.slice(0, 3)}<span>${day}</span></label><div class="stepper"><button type="button" aria-label="Decrease ${day} sleep">−</button><input id="sleep-${index}" type="number" min="0" max="24" step="0.5" inputmode="decimal" value="${state.hours[day]}" aria-label="${day} hours slept" /><button type="button" aria-label="Increase ${day} sleep">+</button></div><output class="delta ${diff > 0 ? 'surplus' : diff < 0 ? 'deficit' : ''}">${sign(diff)}${formatHours(Math.abs(diff))} hrs</output>`;
    const input = row.querySelector('input')!;
    const update = () => onChange(day, Number(input.value));
    input.addEventListener('input', update);
    row.querySelectorAll('button')[0].addEventListener('click', () => { input.stepDown(); update(); });
    row.querySelectorAll('button')[1].addEventListener('click', () => { input.stepUp(); update(); });
    return row;
  }));
}

export function renderSummary(state: SleepState): void {
  const data = totals(state), percent = Math.round(data.progress), isDebt = data.difference < 0;
  byId<HTMLOutputElement>('message').value = balanceMessage(data.difference);
  byId<HTMLElement>('percent').textContent = `${percent}%`;
  byId<HTMLElement>('progress').style.width = `${data.progress}%`;
  byId<HTMLElement>('progressText').textContent = `${formatHours(data.slept)} of ${formatHours(data.target)} hours`;
  byId<HTMLElement>('remaining').textContent = isDebt ? `${formatHours(Math.abs(data.difference))} hrs to goal` : data.difference ? `${formatHours(data.difference)} hrs ahead` : 'Goal reached';
  const ring = byId<HTMLElement>('ring'); ring.style.setProperty('--amount', `${data.progress * 3.6}deg`); ring.setAttribute('aria-label', `${percent} percent of weekly sleep goal reached`);
}
export const showNotice = (message: string) => { byId<HTMLElement>('notice').textContent = message; };
