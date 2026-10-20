import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from '@libsql/client';
import {LibsqlDatabase} from '../server/vercel/database.mjs';
import {identityRequest} from '../server/vercel/identity.mjs';
import {missingConfiguration} from '../server/vercel/config.mjs';
import {authorizeUpload} from '../server/vercel/uploads.mjs';
import {handleVercel} from '../server/vercel/handler.mjs';
import {clerkBrowserAssets} from '../server/vercel/browser-auth.mjs';
const client=createClient({url:'file::memory:'});after(()=>client.close());
for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')))await client.executeMultiple(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const bucket=new Map();const env={DB:new LibsqlDatabase(client),PCLM_OWNER_EMAIL:'owner@example.test',STORAGE_LABEL:'Turso + private Vercel Blob',BUCKET:{
  async put(k,b){bucket.set(k,typeof b==='string'?new TextEncoder().encode(b):new Uint8Array(b));},
  async get(k){return bucket.has(k)?{body:bucket.get(k)}:null;},async head(k){return bucket.has(k)?{}:null;},async delete(k){bucket.delete(k);},
}};
const origin='https://pclm.test',owner={id:'owner',email:'owner@example.test',name:'Verified Owner'},deps={env,identity:async()=>owner};
let csrf;
const req=(route,body,headers={})=>new Request(origin+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','Origin':origin,'X-CSRF-Token':csrf||'',...headers},body:body?JSON.stringify(body):undefined});
const call=(route,body,headers)=>handleVercel(req(route,body,headers),{},deps);
await test('Native Vercel integration contracts',async t=>{
 await t.test('Missing integrations fail closed without secret values or demo data',async()=>{
  assert.equal(missingConfiguration({}).length,6);
  const r=await handleVercel(req('/api/state'));assert.equal(r.status,503);assert.equal((await r.json()).status,'setup_required');
  const page=await handleVercel(req('/app/dashboard.html'));assert.equal(page.status,503);assert.match(await page.text(),/Setup required/);
 });
 await t.test('Incoming identity headers cannot authenticate internet requests',async()=>{
  const spoof=req('/api/state',null,{'oai-authenticated-user-id':'attacker','oai-authenticated-user-email':'owner@example.test'});
  assert.equal(identityRequest(spoof,null).headers.get('oai-authenticated-user-id'),null);
  const r=await handleVercel(spoof,{}, {...deps,identity:async()=>null});assert.equal(r.status,401);
  assert.equal((await client.execute('SELECT COUNT(*) AS count FROM pclm_workspaces')).rows[0].count,0);
 });
 await t.test('Retained HTML initializes the browser session refresh SDK from its configured origin',()=>{
  const key='pk_test_'+Buffer.from('example.clerk.accounts.dev$').toString('base64');
  const assets=clerkBrowserAssets(key);assert.equal(assets.origin,'https://example.clerk.accounts.dev');assert.match(assets.html,/PARI_AUTH_READY/);assert.match(assets.html,/Clerk.load/);
  assert.throws(()=>clerkBrowserAssets('pk_test_'+Buffer.from('attacker.test/evil$').toString('base64')));
 });
 await t.test('Only the configured verified owner can initialize the workspace',async()=>{
  const r=await handleVercel(req('/api/state'),{}, {...deps,identity:async()=>({...owner,email:'someone@example.test'})});assert.equal(r.status,403);
  assert.equal((await client.execute('SELECT COUNT(*) AS count FROM pclm_workspaces')).rows[0].count,0);
  const boot=await (await call('/api/state')).json();csrf=boot.csrf;assert.equal(boot.authProvider,'clerk');assert.equal(boot.uploadProvider,'vercel-blob');assert.equal(boot.state.cranes.length,0);
 });
 await t.test('Every retained application page serves authenticated bootstrap',async()=>{
  const files=readdirSync(new URL('../pclm/app/',import.meta.url)).filter(f=>f.endsWith('.html'));assert.equal(files.length,36);
  for(const file of files){const r=await call('/app/'+file);assert.equal(r.status,200,file);const html=await r.text();assert.ok(html.includes('window.PARI_BOOTSTRAP=')&&html.includes('"authProvider":"clerk"'),file);assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.ok(r.headers.get('Content-Security-Policy').includes('https://vercel.com/api/blob'));}
  const r=await handleVercel(req('/app/dashboard.html'),{}, {...deps,identity:async()=>null});assert.equal(r.status,302);assert.match(r.headers.get('Location'),/\/sign-in\?/);
  for(const path of ['/sw.js','/manifest.webmanifest']){const r=await handleVercel(req(path),{}, {...deps,identity:async()=>{throw Error('Static support files must not call auth');}});assert.equal(r.status,200,path);}
 });
 await t.test('Turso adapter preserves real write-batch rollback',async()=>{
  await assert.rejects(env.DB.batch([env.DB.prepare('INSERT INTO pclm_workspaces(id,owner,metadata) VALUES(?,?,?)').bind('rollback','test','{}'),env.DB.prepare('INSERT INTO pclm_workspaces(id,owner,metadata) VALUES(?,?,?)').bind('org_1','duplicate','{}')]));
  assert.equal(await env.DB.prepare('SELECT id FROM pclm_workspaces WHERE id=?').bind('rollback').first(),null);
 });
 await t.test('JSON prepare, scoped upload authorization and checksum finalization support files above 4.5 MB',async()=>{
  const bytes=new Uint8Array(6*1024*1024).fill(42),sha256=createHash('sha256').update(bytes).digest('hex');
  let r=await call('/api/files/prepare',{id:'large_original',name:'original.pdf',mime:'application/pdf',size:bytes.length,sha256});assert.equal(r.status,201,await r.clone().text());
  const prepared=await r.json();const permit=await authorizeUpload(identityRequest(req('/api/blob-upload',{}),owner),env,prepared.pathname);
  assert.equal(permit.maximumSizeInBytes,bytes.length);assert.equal(permit.allowOverwrite,false);
  await assert.rejects(authorizeUpload(identityRequest(req('/api/blob-upload',{}, {'X-CSRF-Token':'bad'}),owner),env,prepared.pathname),e=>e.status===403);
  await assert.rejects(authorizeUpload(identityRequest(req('/api/blob-upload',{}),owner),env,'other_workspace/large_original'),e=>e.status===403);
  await env.BUCKET.put(prepared.pathname,bytes);r=await call('/api/files/finalize',{id:'large_original'});assert.equal(r.status,201);assert.equal((await r.json()).status,'ready');
  r=await call('/api/files/large_original');assert.equal(r.status,200);assert.equal(createHash('sha256').update(new Uint8Array(await r.arrayBuffer())).digest('hex'),sha256);
  await assert.rejects(authorizeUpload(identityRequest(req('/api/blob-upload',{}),owner),env,prepared.pathname),e=>e.status===409);
 });
 await t.test('Tampered files never become ready and upload routes reject GET',async()=>{
  const hash=createHash('sha256').update('expected').digest('hex');const r=await call('/api/files/prepare',{id:'tampered',name:'evidence.txt',size:8,sha256:hash});assert.equal(r.status,201);
  await env.BUCKET.put('org_1/tampered','modified');const rejected=await call('/api/files/finalize',{id:'tampered'});assert.equal(rejected.status,409);
  const f=await env.DB.prepare('SELECT data FROM pclm_files WHERE id=?').bind('tampered').first();assert.equal(JSON.parse(f.data).status,'uploading');
  assert.equal((await call('/api/files/prepare')).status,405);
 });
 await t.test('Health labels actual storage and auth return paths stay same-origin',async()=>{
  const r=await call('/api/health');assert.equal(r.status,200);assert.equal((await r.json()).storage,'Turso + private Vercel Blob');
  const redirect=await call('/signin-with-chatgpt?return_to='+encodeURIComponent('//attacker.test'));assert.equal(new URL(redirect.headers.get('Location')).origin,origin);
  assert.equal((await call('/unknown.html')).status,404);
 });
});
