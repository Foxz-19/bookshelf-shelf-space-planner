import { isTrip } from './calculator.js';
const KEY = 'fuelway-trip-v1';
/** @param {import('./calculator.js').Trip} trip */
export function saveTrip(trip) {
  try { localStorage.setItem(KEY, JSON.stringify(trip)); return null; } catch { return 'Your latest changes could not be saved on this device.'; }
}
/** @returns {{trip: import('./calculator.js').Trip|null,error:string|null}} */
export function loadTrip() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return { trip:null, error:null }; const trip = JSON.parse(raw); return isTrip(trip) ? {trip, error:null} : {trip:null,error:'Saved trip data was reset because it was invalid.'}; }
  catch { return { trip:null, error:'Saved trip data could not be accessed; changes will stay in this session.'}; }
}
