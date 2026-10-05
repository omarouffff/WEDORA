export function money(value:number){return new Intl.NumberFormat("en-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(value)}
export function daysUntil(date:string){return Math.max(0,Math.ceil((new Date(date).getTime()-Date.now())/86400000))}
