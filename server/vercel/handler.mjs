import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {handleApi,account,bootstrap,json} from '../runtime.mjs';
import {Problem,CUSTOMER,TECH,ADMIN} from '../model.mjs';
import {missingConfiguration,configurationResponse} from './config.mjs';
import {getEnvironment} from './environment.mjs';
import {verifiedIdentity,identityRequest} from './identity.mjs';
import {prepareUpload,finalizeUpload,uploadToken} from './uploads.mjs';
import {clerkBrowserAssets} from './browser-auth.mjs';
let allowed;
async function source(route) {
  allowed ??= (async()=>new Set(['/index.html','/contact.html','/auth/login.html','/auth/register.html','/sw.js','/manifest.webmanifest',...(await readdir(path.join(process.cwd(),'pclm/app'))).filter(f=>f.endsWith('.html')).map(f=>'/app/'+f)]))();
  if(!(await allowed).has(route))return null;
  return readFile(path.join(process.cwd(),'pclm',route.slice(1)),'utf8');
}
function harden(response) {
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','private, no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');
  headers.set('X-Frame-Options','DENY');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  let accountOrigin='';try{accountOrigin=clerkBrowserAssets().origin;}catch{}
  headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' "+accountOrigin+"; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://vercel.com/api/blob https://vercel.com/api/blob/ https://blob.vercel-storage.com https://*.blob.vercel-storage.com "+accountOrigin+"; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  return new Response(response.body,{status:response.status,headers});
}
function withProvider(boot) {return {...boot,hosted:true,authProvider:'clerk',uploadProvider:'vercel-blob'};}
export async function handleVercel(request,context={},deps={}) {
  let route;
  try {route=decodeURIComponent(new URL(request.url).pathname);} catch {return json({message:'Invalid URL.'},400);}
  const url=new URL(request.url),missing=deps.env?[]:missingConfiguration();
  if(missing.length) return route.startsWith('/api/')?harden(json({status:'setup_required',missing,message:'Connect the required Vercel services; see VERCEL.md.'},503)):configurationResponse(missing);
  const redirect=dest=>harden(Response.redirect(new URL(dest,url),302));
  if(route==='/auth/register.html')return redirect('/sign-up');
  if(route==='/signin-with-chatgpt') {
    const to=url.searchParams.get('return_to') || '/app/dashboard.html';
    const safe=to.startsWith('/')&&!to.startsWith('//')&&!to.includes('\\')?to:'/app/dashboard.html';
    return redirect('/sign-in?force_redirect_url='+encodeURIComponent(safe));
  }
  if(route==='/signout-with-chatgpt')return redirect('/sign-out');
  try {
    const env=deps.env||getEnvironment();
    if(route==='/api/health')await env.DB.prepare('SELECT id FROM pclm_workspaces LIMIT 1').first();
    const raw=route.startsWith('/api/')?null:await source(route);
    if(!route.startsWith('/api/')&&!raw)return harden(new Response('Page not found.',{status:404}));
    if(route==='/sw.js'||route==='/manifest.webmanifest')return harden(new Response(raw,{headers:{'Content-Type':route.endsWith('.js')?'application/javascript':'application/manifest+json'}}));
    const authenticate=async()=>identityRequest(request,await(deps.identity?deps.identity():verifiedIdentity()));
    if(route==='/api/blob-upload')return harden(await uploadToken(request,env,authenticate));
    const verified=await authenticate();
    if(route==='/api/files/prepare')return harden(await prepareUpload(verified,env));
    if(route==='/api/files/finalize')return harden(await finalizeUpload(verified,env));
    if(route.startsWith('/api/')) {
      const result=await handleApi(verified,env,context);
      if(route==='/api/state'&&result.ok)return harden(json(withProvider(await result.json())));
      if(route==='/api/bootstrap.js'&&result.ok){const u=await account(verified,env);return harden(new Response('window.PARI_BOOTSTRAP='+JSON.stringify(withProvider(await bootstrap(env,u))).replaceAll('<','\\u003c')+';',{headers:{'Content-Type':'application/javascript; charset=utf-8'}}));}
      return harden(result);
    }
    const token=url.searchParams.get('token');let u;
    if(token){try{u=await account(verified,env,false);}catch{}}
    else u=await account(verified,env);
    if(route.startsWith('/app/')) {
      if(!u)throw new Problem('Sign in to continue.',401);
      const file=route.split('/').at(-1);
      if(u.role===CUSTOMER&&!['customer-portal.html','service-requests.html','approvals.html','reports.html','notifications.html'].includes(file))return redirect('/app/customer-portal.html');
      if(TECH.includes(u.role)&&!['dashboard.html','cranes.html','crane-detail.html','inspections.html','pm-schedule.html','breakdowns.html','work-orders.html','visits.html','components.html','documents.html','service-requests.html','notifications.html','usage.html'].includes(file))return redirect('/app/work-orders.html');
      if(file==='users.html'&&!ADMIN.includes(u.role))throw new Problem('Administrator access required.',403);
    }
    if(route.startsWith('/auth/')&&u&&!token)return redirect('/app/dashboard.html');
    const boot=withProvider(u?await bootstrap(env,u):{server:true,authenticated:false,state:null,user:null});
    const script='<script>window.PARI_BOOTSTRAP='+JSON.stringify(boot).replaceAll('<','\\u003c')+';</script>';
    const html=raw.includes('js/mock-data.js')?raw.replace(/<script src="(?:\.\.\/)?assets\/js\/mock-data.js"><\/script>/,script+'\n$&'):raw.replace('</head>',script+'</head>');
    return harden(new Response(html.replace('</head>',clerkBrowserAssets().html+'</head>'),{headers:{'Content-Type':'text/html; charset=utf-8'}}));
  } catch(error) {
    if(error.status===401&&!route.startsWith('/api/'))return redirect('/sign-in?force_redirect_url='+encodeURIComponent(route+url.search));
    if(!(error instanceof Problem))console.error('pclm_vercel_request_failed',error.message);
    const message=error instanceof Problem?error.message:'The workspace could not load. Check the database migration and service connections, then retry.';
    if(route.startsWith('/api/'))return harden(json({message},error.status||503));
    return harden(new Response('<!doctype html><html><meta name="viewport" content="width=device-width"><title>PCLM · Access</title><body style="background:#0A121C;color:#e8edf3;font:17px/1.7 system-ui;max-width:680px;margin:12vh auto;padding:24px"><h1>PCLM</h1><p>'+message.replaceAll('<','&lt;')+'</p><a style="color:#d1b36a" href="/app/dashboard.html">Retry workspace</a> · <a style="color:#d1b36a" href="/sign-out">Use another account</a></body></html>',{status:error.status||503,headers:{'Content-Type':'text/html; charset=utf-8'}}));
  }
}
