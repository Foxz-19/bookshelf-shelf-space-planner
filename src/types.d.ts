export type Unit='imperial'|'metric';
export type Currency='USD'|'EUR'|'IDR';
export interface Trip { distance:number; efficiency:number; tank:number; price:number; start:number; unit:Unit; currency:Currency }
export interface Plan { stops:number; fuel:number; cost:number; range:number }
