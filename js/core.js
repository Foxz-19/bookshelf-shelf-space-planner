/** @typedef {{id:string,width:number,height:number,type?:string}} Measurement */
/** @typedef {{walls:Measurement[],openings:Measurement[],coats:number}} PaintState */
export const COVERAGE_PER_GALLON = 350;
export const validMeasurement=(w,h)=>Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0&&w<=1e4&&h<=1e4;
export const areaOf=({width:w,height:h})=>w*h;
export function summary(s){const walls=s.walls.reduce((n,x)=>n+areaOf(x),0),opens=s.openings.reduce((n,x)=>n+areaOf(x),0),paintable=Math.max(0,walls-opens)*s.coats,exact=paintable/COVERAGE_PER_GALLON;return{paintable,exact,buy:Math.ceil(exact)}}
export const createId = () => crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
