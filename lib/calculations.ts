export type RSVPState="PENDING"|"CONFIRMED"|"DECLINED";
export function planningProgress(statuses:readonly string[]){return statuses.length?Math.round(statuses.filter(x=>x==="DONE").length/statuses.length*100):0}
export function budgetSummary(total:number,amounts:readonly number[]){const spent=amounts.reduce((a,b)=>a+b,0);return{total,spent,remaining:total-spent,overBudget:spent>total}}
export function guestSummary(statuses:readonly RSVPState[]){return{total:statuses.length,confirmed:statuses.filter(s=>s==="CONFIRMED").length,pending:statuses.filter(s=>s==="PENDING").length,declined:statuses.filter(s=>s==="DECLINED").length}}
export function bookingTransition(current:string,next:string){const allowed:Record<string,string[]>={PENDING:["CONFIRMED","REJECTED","CANCELLED"],CONFIRMED:["CANCELLED","COMPLETED"],REJECTED:[],CANCELLED:[],COMPLETED:[]};if(!allowed[current]?.includes(next))throw new Error(`Cannot change booking from ${current} to ${next}`);return next}
