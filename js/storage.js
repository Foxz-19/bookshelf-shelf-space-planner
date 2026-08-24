import { validMeasurement } from './core.js';
const KEY='roller-paint-state-v1';
export const blankState = () => ({walls:[],openings:[],coats:2});
const valid=x=>validMeasurement(x?.width,x?.height)&&/^[\w.-]+$/.test(x?.id);
const validWall=x=>valid(x)&&x.type===undefined,validOpening=x=>valid(x)&&['Door','Window','Other opening'].includes(x.type);
export function loadState(){try{const data=localStorage.getItem(KEY);if(!data)return {state:blankState(),error:null};const state=JSON.parse(data);if(!Array.isArray(state.walls)||!Array.isArray(state.openings)||!state.walls.every(validWall)||!state.openings.every(validOpening)||!Number.isInteger(state.coats)||state.coats<1||state.coats>10)throw Error('invalid');return {state,error:null};}catch{return {state:blankState(),error:'Could not restore saved plan.'};}}
export function saveState(state){try{localStorage.setItem(KEY,JSON.stringify(state));return null;}catch{return 'Changes were not saved.';}}
