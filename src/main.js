import { calculatePlan, convertTripUnit, validateTrip } from './calculator.js';
import { loadTrip, saveTrip } from './storage.js';
import { createUI } from './ui.js';

const defaults = { distance:480, efficiency:28, tank:14, price:3.59, start:75, unit:'imperial', currency:'USD' };
const presets = { compact:{efficiency:32,tank:12}, suv:{efficiency:22,tank:18}, hybrid:{efficiency:50,tank:11} };
const ui=createUI(document); const loaded=loadTrip(); let state={...defaults,...(loaded.trip||{})}; let lastSaveError=null; ui.setInputs(state); if(loaded.error){ui.setSaveMessage(loaded.error);ui.toast(loaded.error,true);}
function read(){ for(const key of ['distance','efficiency','tank','price','start']) { const input=/** @type {HTMLInputElement} */(document.getElementById(key)); state[key]=input.value===''?NaN:input.valueAsNumber; } state.currency=/** @type {import('./calculator.js').Currency} */(/** @type {HTMLSelectElement} */(document.getElementById('currency')).value); }
function update(){read();ui.setUnit(state.unit,state.currency);const error=validateTrip(state);ui.render(state,error?null:calculatePlan(state),error);if(!error){const saveError=saveTrip(state);ui.setSaveMessage(saveError);if(saveError&&saveError!==lastSaveError)ui.toast(saveError,true);lastSaveError=saveError;}}
/** @param {'imperial'|'metric'} nextUnit */
function convertUnits(nextUnit){
  if(state.unit===nextUnit)return;
  read(); state=convertTripUnit(state,nextUnit); ui.setInputs(state);
}
document.getElementById('trip-form').addEventListener('input',update);
document.getElementById('trip-form').addEventListener('change',update);
document.getElementById('vehicle').addEventListener('change',event=>{const preset=presets[/** @type {HTMLSelectElement} */(event.currentTarget).value];if(!preset)return;const nextUnit=state.unit;state={...state,...preset,unit:'imperial'};if(nextUnit==='metric')state=convertTripUnit(state,'metric');ui.setInputs(state);update();});
document.querySelectorAll('[data-unit]').forEach(button=>button.addEventListener('click',()=>{convertUnits(/** @type {'imperial'|'metric'} */(button.dataset.unit));update();}));
document.getElementById('share').addEventListener('click',async()=>{read();const error=validateTrip(state);if(error){ui.toast('Complete valid trip details before sharing.',true);return;}const plan=calculatePlan(state);const text=`Fuelway plan: ${plan.stops} fuel stop${plan.stops===1?'':'s'}, ${new Intl.NumberFormat(undefined,{style:'currency',currency:state.currency,maximumFractionDigits:state.currency==='IDR'?0:2}).format(plan.cost)}, ${plan.fuel.toFixed(1)} ${state.unit==='imperial'?'gal':'L'} required.`;try{if(navigator.share)await navigator.share({title:'Fuelway road trip plan',text});else await navigator.clipboard.writeText(text);ui.toast(navigator.share?'Plan shared.':'Plan copied to clipboard.');}catch(error){if(error.name!=='AbortError')ui.toast('Could not share the plan on this device.',true);}});
document.getElementById('print').addEventListener('click',()=>window.print());
update();
