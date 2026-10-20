// HTTP checks of the production Next.js build, not browser interaction tests.
// Uses an isolated loopback listener and no live user or service credentials.
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const routes=JSON.parse(readFileSync('.next/routes-manifest.json','utf8'));
assert.ok(routes.dynamicRoutes.some(r=>r.page==='/[...path]'));
const trace=JSON.parse(readFileSync('.next/server/app/[...path]/route.js.nft.json','utf8'));
const tracedPages=trace.files.filter(f=>/pclm\/app\/[^/]+\.html$/.test(f));assert.equal(tracedPages.length,36,'Deployment must trace every retained page');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','0'],{stdio:['ignore','pipe','pipe'],env:Object.fromEntries(Object.entries(process.env).filter(([key])=>!['CLERK_SECRET_KEY','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','TURSO_DATABASE_URL','TURSO_AUTH_TOKEN','BLOB_READ_WRITE_TOKEN','PCLM_OWNER_EMAIL'].includes(key)))});
let log='';child.stdout.on('data',c=>log+=c);child.stderr.on('data',c=>log+=c);
try {
 let port;
 for(let tries=0;tries<200;tries++) {
   const match=log.match(/127\.0\.0\.1:(\d+)/);if(match&&log.includes('Ready')){port=Number(match[1]);break;}
   if(child.exitCode!==null)throw Error('Next.js exited: '+log);
   await new Promise(resolve=>setTimeout(resolve,50));
 }
 assert.ok(port,'Production server did not become ready: '+log);const base='http://127.0.0.1:'+port;
 let r=await fetch(base+'/',{redirect:'manual'});assert.ok([307,308].includes(r.status));assert.equal(r.headers.get('Location'),'/app/dashboard.html');
 r=await fetch(base+'/api/health');assert.equal(r.status,503);assert.equal((await r.json()).status,'setup_required');
 r=await fetch(base+'/app/dashboard.html');assert.equal(r.status,503);assert.match(await r.text(),/Setup required/);
 for(const file of ['/assets/js/server-client.js','/assets/js/store.js','/assets/vendor/blob-client.js','/assets/css/app.css','/assets/img/logo-mark.svg']){const asset=await fetch(base+file);assert.equal(asset.status,200,file);}
 r=await fetch(base+'/sign-in');assert.equal(r.status,200);assert.match(await r.text(),/Sign-in setup required/);
 console.log('PASS production Next.js HTTP: routes manifest, 36 traced pages, assets, secure setup responses and sign-in configuration screen');
} finally {
 child.kill('SIGTERM');if(child.exitCode===null)await once(child,'exit');
}
