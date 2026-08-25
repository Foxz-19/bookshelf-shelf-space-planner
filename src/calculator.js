/** @typedef {'imperial'|'metric'} Unit */
/** @typedef {'USD'|'EUR'|'IDR'} Currency */
/** @typedef {{distance:number, efficiency:number, tank:number, price:number, start:number, unit:Unit, currency:Currency}} Trip */
/** @typedef {{stops:number, fuel:number, cost:number, range:number}} Plan */

export const RESERVE = 0.1;
/** @param {Trip} trip @returns {string|null} */
export function validateTrip(trip) {
  if (trip.unit !== 'imperial' && trip.unit !== 'metric') return 'Choose miles/gallons or kilometres/litres.';
  if (!['USD','EUR','IDR'].includes(trip.currency)) return 'Choose a supported currency.';
  if (!Number.isFinite(trip.distance) || trip.distance < 0) return 'Enter a trip distance of zero or more.';
  if (!Number.isFinite(trip.efficiency) || trip.efficiency <= 0) return 'Fuel efficiency must be greater than zero.';
  if (!Number.isFinite(trip.tank) || trip.tank <= 0) return 'Tank size must be greater than zero.';
  if (!Number.isFinite(trip.price)) return 'Enter a current fuel price.';
  if (trip.price < 0) return 'Fuel price cannot be negative.';
  if (!Number.isFinite(trip.start) || trip.start < 0 || trip.start > 100) return 'Starting fuel must be between 0% and 100%.';
  return null;
}
/** Runtime schema guard for persisted browser data. @param {unknown} value @returns {value is Trip} */
export function isTrip(value) {
  if (!value || typeof value !== 'object') return false;
  return validateTrip(/** @type {Trip} */ (value)) === null;
}
/** @param {Trip} trip @returns {Plan} */
export function calculatePlan(trip) {
  const efficiencyPerUnit = trip.unit === 'imperial' ? trip.efficiency : 100 / trip.efficiency;
  const fuel = trip.distance / efficiencyPerUnit;
  const safeTank = trip.tank * (1 - RESERVE);
  const firstLeg = Math.max(0, trip.tank * ((trip.start / 100) - RESERVE)) * efficiencyPerUnit;
  const regularRange = safeTank * efficiencyPerUnit;
  const remaining = Math.max(0, trip.distance - firstLeg);
  return { fuel, cost: fuel * trip.price, range: regularRange, stops: remaining === 0 ? 0 : Math.ceil(remaining / regularRange) };
}
/** Converts all physical values while retaining the same route plan. @param {Trip} trip @param {Unit} nextUnit @returns {Trip} */
export function convertTripUnit(trip, nextUnit) {
  if (trip.unit === nextUnit) return trip;
  if (validateTrip(trip)) return { ...trip, unit: nextUnit };
  const metric = nextUnit === 'metric';
  const rounded = (value) => Number(value.toFixed(2));
  return {
    ...trip, unit: nextUnit,
    distance: rounded(trip.distance * (metric ? 1.609344 : 1 / 1.609344)),
    efficiency: rounded(235.214583 / trip.efficiency),
    tank: rounded(trip.tank * (metric ? 3.785412 : 1 / 3.785412)),
    price: rounded(trip.price * (metric ? 1 / 3.785412 : 3.785412))
  };
}
/** @param {number} value @param {Unit} unit */
export function formatDistance(value, unit) { return `${Math.round(value).toLocaleString()} ${unit === 'imperial' ? 'mi' : 'km'}`; }
