import handler from 'vinext/server/fetch-handler';
import {handleApi,account,bootstrap} from '../server/runtime.mjs';
import {Problem,CUSTOMER,TECH,ADMIN} from '../server/model.mjs';
import {pageSource} from '../server/pages';
function harden(response:Response){const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');headers.set('Cache-Control','private, no-store');headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors https://chatgpt.com; form-action 'self'");return new Response(response.body,{status:response.status,headers});}
export default {async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
 const url=new URL(request.url);let path=decodeURIComponent(url.pathname);
 if(path.startsWith('/api/'))return harden(await handleApi(request,env,ctx));
 if(path==='/auth/register.html')return harden(Response.redirect(new URL('/auth/login.html',url),302));
 if(path==='/index.html')path='/index.html';
 if(path==='/')return harden(Response.redirect(new URL('/app/dashboard.html',url),302));
 if(path==='/sw.js'||path==='/manifest.webmanifest'){const raw=await import.meta.glob('../pclm/{sw.js,manifest.webmanifest}',{query:'?raw',import:'default',eager:true}) as Record<string,string>;const source=raw['../pclm'+path];return harden(new Response(source,{headers:{'Content-Type':path.endsWith('.js')?'application/javascript':'application/manifest+json'}}));}
 const source=pageSource(path);
 if(source){try{
  const token=url.searchParams.get('token');let u:any=null;
  if(!token)u=await account(request,env);
  else try{u=await account(request,env,false);}catch{}
  if(path.startsWith('/app/')){
   if(!u)throw new Problem('Sign in to continue.',401);
   const file=path.split('/').at(-1);
   if(u.role===CUSTOMER&&!['customer-portal.html','service-requests.html','approvals.html','reports.html','notifications.html'].includes(file!))return harden(Response.redirect(new URL('/app/customer-portal.html',url),302));
   if(TECH.includes(u.role)&&!['dashboard.html','cranes.html','crane-detail.html','inspections.html','pm-schedule.html','breakdowns.html','work-orders.html','visits.html','components.html','documents.html','service-requests.html','notifications.html','usage.html'].includes(file!))return harden(Response.redirect(new URL('/app/work-orders.html',url),302));
   if(file==='users.html'&&!ADMIN.includes(u.role))throw new Problem('Administrator access required.',403);
  }
  if(path.startsWith('/auth/')&&u&&!token)return harden(Response.redirect(new URL('/app/dashboard.html',url),302));
  const boot=u?await bootstrap(env,u):{server:true,hosted:true,authenticated:false,state:null,user:null};
  const script='<script>window.PARI_BOOTSTRAP='+JSON.stringify(boot).replaceAll('<','\\u003c')+';</script>';
  const html=source.includes('js/mock-data.js')?source.replace(/<script src="(?:\.\.\/)?assets\/js\/mock-data.js"><\/script>/,script+'\n$&'):source.replace('</head>',script+'</head>');
  return harden(new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}}));
 }catch(error:any){
  if(error.status===401)return harden(Response.redirect(new URL('/signin-with-chatgpt?return_to='+encodeURIComponent(path+url.search),url),302));
  const message=error instanceof Problem?error.message:'The workspace could not load. Please retry.';
  return harden(new Response('<!doctype html><html><meta name="viewport" content="width=device-width"><title>PCLM · Access</title><body style="background:#0A121C;color:#e8edf3;font:17px system-ui;max-width:650px;margin:12vh auto;padding:24px"><h1>PCLM</h1><p>'+message.replaceAll('<','&lt;')+'</p><a href="/app/dashboard.html" style="color:#d1b36a">Retry workspace</a> · <a href="/signout-with-chatgpt?return_to=/auth/login.html" style="color:#d1b36a">Use another account</a></body></html>',{status:error.status||503,headers:{'Content-Type':'text/html; charset=utf-8'}}));
 }}
 return handler.fetch(request,env,ctx);
}};
