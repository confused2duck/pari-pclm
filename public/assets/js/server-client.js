/* Shared-server bridge. Keeps the existing Alpine components and optimistic UI. */
(function(){
'use strict';
const boot=window.PARI_BOOTSTRAP;
const active=!!boot?.server;
const clone=v=>JSON.parse(JSON.stringify(v));
const ownVersions=new Map();
let revision=boot?.revision||0,csrf=boot?.csrf||'',queue=Promise.resolve(),lastError=null,busy=0,synchronising=null;
const ignored=new Set(['users','audit','accounts','kpis','currentPlant','organizations','roleMatrix','permissionContext','eventTypes','pmTrend','breakdownTrend','statutoryAlerts','createdAt','version','org']);
const derived={plants:['crane_count'],cranes:['pm_compliance','open_actions','last_inspection','mtbf_h','score'],fleetDocuments:['status'],fleetStatutory:['status','days_left'],spares:['status'],fleetInspections:['findings_count'],fleetPmTasks:[]};
const userKey=()=> 'pari.live.'+(window.PARI_BOOTSTRAP?.user?.id||'guest');
const pendingKey=()=>userKey()+'.pending';
function setStatus(text,error=false){const el=document.querySelector('[data-sync-status]');if(el){el.textContent=text;el.style.color=error?'var(--danger-400)':'var(--text-dim)';}}
async function api(path,body,method='POST',headers={}){
 const response=await fetch(path,{method,credentials:'same-origin',headers:{...(body instanceof Blob?{}:{'Content-Type':'application/json'}),'X-CSRF-Token':csrf,...headers},body:body==null?undefined:body instanceof Blob?body:JSON.stringify(body)});
 const type=response.headers.get('Content-Type')||'';
 if(!response.ok){const error=type.includes('json')?await response.json():{message:'Request failed ('+response.status+')'};throw Object.assign(new Error(error.message),{status:response.status});}
 return type.includes('json')?response.json():response.blob();
}
function reconcile(target,next){
 for(const [key,value]of Object.entries(next)){
  if(Array.isArray(value)&&Array.isArray(target[key])){
   const old=new Map(target[key].filter(x=>x&&typeof x==='object'&&x.id).map(x=>[x.id,x]));
   const rows=value.map(row=>{if(row&&typeof row==='object'&&row.id&&old.has(row.id)){const entry=old.get(row.id);for(const k of Object.keys(entry))if(!(k in row))delete entry[k];Object.assign(entry,row);return entry;}return row;});
   target[key].splice(0,target[key].length,...rows);
  }else if(value&&typeof value==='object'&&!Array.isArray(value)&&target[key]&&typeof target[key]==='object'&&!Array.isArray(target[key]))Object.assign(target[key],value);
  else target[key]=value;
 }
}
function apply(response){
 if(!response.state)return;
 revision=response.revision;csrf=response.csrf||csrf;
 if(response.user)window.PARI_BOOTSTRAP.user=response.user;
 const data=window.PARI,selected=localStorage.getItem(userKey()+'.plant');
 reconcile(data,response.state);
 if(selected&&data.plants.some(p=>p.id===selected))Object.assign(data.currentPlant,data.plants.find(p=>p.id===selected));
 window.PARI_STORE?.derive();
 localStorage.setItem(userKey()+'.cache',JSON.stringify({state:clone(data),user:response.user||boot.user,revision,csrf}));
 document.dispatchEvent(new CustomEvent('pari:changed'));
 setStatus(navigator.onLine?'Saved to shared server':'Offline · drafts on this device');
}
function diff(before,after){
 const changes=[];
 for(const [collection,rows]of Object.entries(after)){
  if(ignored.has(collection)||['preferences','snoozedUntil'].includes(collection))continue;
  if(collection==='thresholds'){if(JSON.stringify(before.thresholds)!==JSON.stringify(rows))changes.push({collection,fields:rows});continue;}
  if(!Array.isArray(rows))continue;
  const prior=new Map((before[collection]||[]).filter(x=>x?.id).map(x=>[x.id,x]));
  for(const row of rows){if(!row?.id)continue;const old=prior.get(row.id),fields={};for(const [key,value]of Object.entries(row)){if(['id','_version','organization_id','approved_by','approved_at',...(derived[collection]||[])].includes(key))continue;if(!old||JSON.stringify(old[key])!==JSON.stringify(value))fields[key]=value;}
   if(Object.keys(fields).length)changes.push({collection,id:row.id,operation:'upsert',expected_version:old?old._version||1:null,fields});
  }
 }
 return changes;
}
function pending(){try{return JSON.parse(localStorage.getItem(pendingKey())||'[]');}catch{return [];}}
function cacheDraft(state){localStorage.setItem(userKey()+'.cache',JSON.stringify({state:clone(state),user:boot.user,revision,csrf}));}
if(active&&boot.user&&!navigator.onLine){try{const cached=JSON.parse(localStorage.getItem(userKey()+'.cache')||'null');if(cached?.user?.id===boot.user.id)boot.state=cached.state;}catch{}}
function keep(item){const items=pending();items.push(item);localStorage.setItem(pendingKey(),JSON.stringify(items));}
async function sendItem(item){setStatus('Saving…');for(const c of item.changes){const known=ownVersions.get(c.collection+'|'+c.id);if(known?.from.has(c.expected_version))c.expected_version=known.to;}const result=await api('/api/transactions',item);for(const v of result.ack?.versions||[]){const change=item.changes.find(c=>c.collection===v.collection&&c.id===v.id);if(!change)continue;const key=v.collection+'|'+v.id,known=ownVersions.get(key)||{from:new Set()};known.from.add(change.expected_version);known.to=v.version;ownVersions.set(key,known);}apply(result);return result;}
const Live=window.PARI_LIVE={active,api,apply,get revision(){return revision;},
 user(){return window.PARI_BOOTSTRAP?.user||null;},
 commit(store,action,before){
  const after=clone(store.data),old=JSON.parse(before),changes=diff(old,after),preferences={preferences:after.preferences,snoozedUntil:after.snoozedUntil};
  if(JSON.stringify(old.currentPlant)!==JSON.stringify(after.currentPlant))localStorage.setItem(userKey()+'.plant',after.currentPlant.id);
  if(!changes.length&&JSON.stringify(preferences)===JSON.stringify({preferences:old.preferences,snoozedUntil:old.snoozedUntil})){document.dispatchEvent(new CustomEvent('pari:changed'));return;}
  const item={action,changes,preferences,transaction_id:'tx_'+crypto.randomUUID().replaceAll('-','')};document.dispatchEvent(new CustomEvent('pari:changed'));
  if(!navigator.onLine||pending().length){keep(item);cacheDraft(after);setStatus('Offline · '+pending().length+' draft(s) queued');if(navigator.onLine)Live.sync().catch(e=>setStatus(e.message,true));return;}
  busy++;queue=queue.then(()=>sendItem(item)).catch(async error=>{lastError=error;if(error.status===409)keep({...item,conflict:true});window.PARI_UI?.toast(error.message);try{apply(await api('/api/state',null,'GET'));}catch{}setStatus(error.message,true); }).finally(()=>busy--);
 },
 async flush(){await queue;if(lastError){const err=lastError;lastError=null;throw err;}},
 async refresh(){await this.flush();const result=await api('/api/state',null,'GET');apply(result);return result;},
 async command(body){await this.flush();const collection={handover:'projects',create_work_order:'serviceRequests',upgrade_project:'modernizations',renew_contract:'contracts',recalculate_pm:'pmRules',receive_order:'orders'}[body.type]||body.collection;const row=window.PARI[collection]?.find(r=>r.id===body.id);body={...body,expected_version:body.expected_version??row?._version};const result=await api('/api/command',body);apply(result);return result.result;},
 queueFile(id,file){const key=userKey()+'.files',files=JSON.parse(localStorage.getItem(key)||'[]');files.push({id,name:file.name,mime:file.type});localStorage.setItem(key,JSON.stringify(files));},
 async sync(){
  if(!navigator.onLine)return;
  if(synchronising)return synchronising;
  synchronising=(async()=>{
   const items=pending();if(items.some(x=>x.conflict)){setStatus('Draft conflict · review pending changes',true);return;}
   const fileKey=userKey()+'.files',files=JSON.parse(localStorage.getItem(fileKey)||'[]');
   while(files.length){const entry=files[0],blob=await window.PARI_STORE.files.localGet(entry.id);if(!blob)throw Error('An offline attachment is missing. Export your draft and attach the file again.');await api('/api/files/'+entry.id,blob,'POST',{'Content-Type':entry.mime||'application/octet-stream','X-Filename':encodeURIComponent(entry.name)});files.shift();localStorage.setItem(fileKey,JSON.stringify(files));}
   if(!items.length)return;
   // Merge repeated edits into one atomic transaction using the original row version.
   const merged=new Map();for(const item of items)for(const change of item.changes){const key=change.collection+'|'+(change.id||'');if(merged.has(key))Object.assign(merged.get(key).fields,change.fields);else merged.set(key,clone(change));}
   setStatus('Synchronising offline drafts…');
   try{const result=await api('/api/transactions',{action:'Synchronised offline drafts: '+items.map(i=>i.action).join('; ').slice(0,120),changes:[...merged.values()],preferences:items.at(-1).preferences});const remaining=pending().slice(items.length);localStorage.setItem(pendingKey(),JSON.stringify(remaining));if(!remaining.length)apply(result);setStatus(remaining.length?'More offline drafts pending':'All offline drafts synchronised');}
   catch(e){const retained=pending();if(e.status===409&&retained[0])retained[0].conflict=true;localStorage.setItem(pendingKey(),JSON.stringify(retained));setStatus('Drafts retained · '+e.message,true);window.PARI_UI?.toast(e.message);}
  })().finally(()=>{synchronising=null;});return synchronising;
 },
 async signout(){await this.flush();await api('/api/auth/logout',{});if('caches' in window){for(const key of await caches.keys())if(key.startsWith('pclm-'))await caches.delete(key);}if('serviceWorker' in navigator){for(const registration of await navigator.serviceWorker.getRegistrations())if(registration.active?.scriptURL.includes('/sw.js'))await registration.unregister();}indexedDB.deleteDatabase('pclm-files-'+Live.user()?.id);localStorage.removeItem(userKey()+'.files');localStorage.removeItem(userKey()+'.cache');localStorage.removeItem(pendingKey());sessionStorage.clear();location.href=boot.hosted?'/signout-with-chatgpt?return_to=/auth/login.html':'/auth/login.html';},
 async authSetup(){
  if(!location.pathname.startsWith('/auth/'))return;
  const form=document.querySelector('form.form-stack');if(form){form.innerHTML='<p class="pari-note">Sign in with your ChatGPT account to open your PCLM workspace.</p><a class="btn btn-primary" style="width:100%;justify-content:center" target="_top" href="/signin-with-chatgpt?return_to=/app/dashboard.html">Continue with ChatGPT</a>';}
  const token=new URLSearchParams(location.search).get('token');if(token){try{const invite=await api('/api/invitation?token='+encodeURIComponent(token),null,'GET');window.PARI_UI.dialog('Join PCLM workspace','<p class="pari-note">Invitation for '+window.PARI_UI.esc(invite.name)+' · '+window.PARI_UI.esc(invite.email)+'</p><p class="pari-note">'+(invite.matches_account?'Your signed-in account matches this invitation.':'Sign in with the invited email before accepting.')+'</p>',async()=>{await api('/api/auth/accept',{token});location.href='/app/dashboard.html';},'Accept invitation');}catch(error){window.PARI_UI.toast(error.message);}}
 }

};
if(active){
 window.addEventListener('online',()=>Live.sync().catch(e=>setStatus(e.message,true)));
 setInterval(async()=>{if(busy||synchronising||pending().length||document.querySelector('dialog[open]')||!navigator.onLine||!Live.user())return;try{const result=await api('/api/state',null,'GET');if(result.revision!==revision)apply(result);}catch(error){if(error.status===401&&location.pathname.startsWith('/app/'))location.href='/auth/login.html';}},5000);
 document.addEventListener('DOMContentLoaded',()=>{if(Live.user()&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js?user='+encodeURIComponent(Live.user().id)).then(()=>navigator.serviceWorker.ready).then(()=>fetch('/api/bootstrap.js')).catch(()=>{});const topbar=document.querySelector('.topbar');if(topbar){const badge=document.createElement('button');badge.className='sync-status';badge.setAttribute('data-sync-status','');badge.setAttribute('aria-label','Synchronisation status and pending drafts');badge.textContent=navigator.onLine?'Shared server':'Offline · '+pending().length+' draft(s) queued';badge.onclick=()=>{const items=pending(),UI=window.PARI_UI;const el=UI.dialog('Synchronisation',`<p class="pari-note">${items.length} pending draft(s) on this device.</p><div class="pari-inline-actions"><button class="btn btn-primary btn-sm" data-sync>Synchronise</button><button class="btn btn-secondary btn-sm" data-export>Export pending drafts</button><button class="btn btn-secondary btn-sm" data-discard>Discard pending drafts and reload</button></div>`);el.querySelector('[data-sync]').onclick=()=>Live.sync();el.querySelector('[data-export]').onclick=()=>UI.download('pclm-pending-drafts.json',JSON.stringify(items,null,2),'application/json');el.querySelector('[data-discard]').onclick=()=>UI.dialog('Discard pending drafts?',UI.field('confirm','Type DISCARD'),data=>{if(data.confirm!=='DISCARD')throw Error('Type DISCARD to confirm.');localStorage.removeItem(pendingKey());location.reload();},'Discard drafts');};topbar.append(badge);if(pending().length)Live.sync();}});
}
})();
