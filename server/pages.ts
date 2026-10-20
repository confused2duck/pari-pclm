const pages=import.meta.glob('../pclm/**/*.html',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
export function pageSource(path:string){return pages['../pclm'+path];}
