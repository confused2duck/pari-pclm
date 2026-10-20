/* Existing Alpine store, backed by the shared server when launched with start.py. */
(function () {
  'use strict';
  const KEY = 'pari.test.v1';
  const seed = JSON.parse(JSON.stringify(window.PARI));
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const addDays = (date, days) => { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const days = date => Math.round((new Date(date+'T12:00:00') - new Date(today()+'T12:00:00')) / 86400000);
  const uid = prefix => prefix + '_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
  function fresh() {
    const s = JSON.parse(JSON.stringify(seed));
    // Keep relative dates useful whenever a new test workspace is initialized.
    const delta = Math.round((new Date(today()+'T12:00:00')-new Date('2026-09-14T12:00:00'))/86400000);
    function shift(o) { for (const k in o) { const v=o[k]; if (typeof v==='string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) o[k]=addDays(v.slice(0,10),delta)+v.slice(10); else if(v && typeof v==='object') shift(v); } }
    shift(s);
    s.organizations=[{...s.org}];s.plants.forEach(p=>p.organization_id=s.org.id);s.users.forEach(u=>u.organization_id=s.org.id);s.notifications.forEach(n=>n.plant_id='plt_1');
    s.fleetInspections.forEach(i => { i.findings = s.inspections.find(j=>j.id===i.id)?.findings || []; });
    delete s.inspections; delete s.pmTasks; delete s.breakdowns; delete s.repeatFlags;
    s.actions=[];
    s.cranes.forEach(c=>{for(let j=0;j<c.open_actions;j++)s.actions.push({id:uid('act'),crane_id:c.id,asset:c.asset_number,description:j===0?'Review inspection findings and verify rectification':'Corrective follow-up '+(j+1),severity:j===0?'major':'minor',status:'open',due_date:addDays(today(),j<2?-2:7),assigned_to:'Plant Engineer',notes:''});});
    s.activity.forEach(a=>a.plant_id='plt_1');
    s.audit=[]; s.orders=[]; s.movements=[]; s.benchmarks=[]; s.accounts=[];
    s.thresholds={count:3,window:120,sla:48};
    s.agencies=[{id:'tpi_1',name:'Prime Cert TPI',email:'',state:'JH'}];
    s.preferences={}; s.snoozedUntil=0; s.version=1; s.createdAt=new Date().toISOString();
    return s;
  }
  let data;
  try { data=JSON.parse(localStorage.getItem(KEY)||'null'); if(data && data.version!==1) throw Error('Unknown data version'); } catch(e) { console.warn('Saved test data unavailable:',e.message); }
  window.PARI=window.PARI_BOOTSTRAP?.state || data || fresh();
  if(window.PARI_BOOTSTRAP?.user){try{const id=localStorage.getItem('pari.live.'+window.PARI_BOOTSTRAP.user.id+'.plant');const plant=window.PARI.plants.find(p=>p.id===id);if(plant)window.PARI.currentPlant={...plant};}catch{}}
  const S = window.PARI_STORE = {
    KEY, today, addDays, days, uid, server:!!window.PARI_LIVE?.active, flush:()=>window.PARI_LIVE?.active?window.PARI_LIVE.flush():Promise.resolve(),
    get data() { return window.PARI; },
    get plant() { return this.data.currentPlant.id; },
    scoped(rows) { return rows.filter(r=>!r.crane_id || this.data.cranes.some(c=>c.id===r.crane_id && c.plant_id===this.plant)); },
    cranes() { return this.data.cranes.filter(c=>c.plant_id===this.plant); },
    derive() {
      const p=this.data;
      p.fleetInspections.forEach(i=>{i.findings ||= []; if(i.findings.length)i.findings_count=i.findings.filter(f=>f.severity && f.severity!=='ok').length;});
      p.fleetPmTasks.forEach(t=>{if(t.status!=='done')t.status=days(t.due_date)<0?'overdue':days(t.due_date)<=7?'due':'upcoming';});
      p.fleetDocuments.forEach(d=>d.status=!d.expiry_date?'perpetual':days(d.expiry_date)<0?'expired':days(d.expiry_date)<=30?'expiring':'valid');
      p.fleetStatutory.forEach(i=>{i.days_left=days(i.scheduled_date);i.status=i.completed_date?'valid':i.days_left<0?'overdue':i.days_left<=30?'due':i.days_left<=90?'upcoming':'valid';});
      p.spares.forEach(s=>s.status=s.on_hand===0?'critical':s.on_hand<s.min_stock?'low':'ok');
      p.cranes.forEach(c=>{ const ts=p.fleetPmTasks.filter(t=>t.crane_id===c.id && t.due_date<=today()); if(ts.length)c.pm_compliance=Math.round(100*ts.filter(t=>t.status==='done').length/ts.length); c.open_actions=p.actions.filter(a=>a.crane_id===c.id&&a.status!=='closed').length; const dates=p.fleetInspections.filter(i=>i.crane_id===c.id&&i.completed_date).map(i=>i.completed_date).sort(); if(dates.length)c.last_inspection=dates.at(-1); });
      const cs=this.cranes(), pm=this.scoped(p.fleetPmTasks).filter(t=>t.due_date<=today()), bs=this.scoped(p.fleetBreakdowns).filter(b=>days(b.datetime_reported.slice(0,10))>=-30), flags=this.scoped(p.fleetRepeatFlags);
      Object.assign(p.kpis,{pmCompliance:pm.length?Math.round(pm.filter(t=>t.status==='done').length/pm.length*100):0,openActions:this.scoped(p.actions).filter(a=>a.status!=='closed').length,breakdowns30d:bs.length,downtimeHours:Math.round(bs.reduce((n,b)=>n+b.downtime_min,0)/60),repeatFailures:flags.filter(f=>f.status!=='closed').length,productionLossINR:bs.reduce((n,b)=>n+b.impact_inr,0)});
      p.plants.forEach(plant=>plant.crane_count=p.cranes.filter(c=>c.plant_id===plant.id).length);
      p.breakdownTrend=Array.from({length:12},(_,n)=>{const a=-7*(11-n),b=a-6;return {w:n===11?'W-0':'W-'+(11-n),v:this.scoped(p.fleetBreakdowns).filter(x=>{const d=days(x.datetime_reported.slice(0,10));return d>=b&&d<=a;}).length};});
      p.pmTrend=Array.from({length:12},(_,n)=>{const a=-7*(11-n),b=a-6,rows=this.scoped(p.fleetPmTasks).filter(x=>{const d=days(x.due_date);return d>=b&&d<=a;});return {w:n===11?'W-0':'W-'+(11-n),v:rows.length?Math.round(100*rows.filter(x=>x.status==='done').length/rows.length):0};});
      p.statutoryAlerts=this.scoped(p.fleetStatutory).filter(i=>!i.completed_date).sort((a,b)=>a.days_left-b.days_left).slice(0,3).map(i=>({crane:i.asset,reg:i.regulation,due:i.scheduled_date,days_left:i.days_left,agency:i.tpi_agency}));
    },
    commit(action, mutate) {
      const before=JSON.stringify(this.data);
      try { const result=mutate(this.data); this.derive(); if(!this.server)this.data.audit.unshift({id:uid('log'),ts:new Date().toISOString(),actor:this.session()?.name||'Demo tester',action,plant:this.plant}); if(this.server){window.PARI_LIVE.commit(this,action,before);return result;} localStorage.setItem(KEY,JSON.stringify(this.data)); document.dispatchEvent(new CustomEvent('pari:changed')); return result; }
      catch(e) { const p=this.data; Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,JSON.parse(before));document.dispatchEvent(new CustomEvent('pari:changed'));throw new Error(e.name==='QuotaExceededError'?'Storage is full. Export a backup before clearing test data.':e.message); }
    },
    session() {if(this.server)return window.PARI_LIVE.user();try{return JSON.parse(sessionStorage.getItem('pari.session')||localStorage.getItem('pari.session')||'null');}catch{return null;}},
    sessionSet(user,remember=false) {sessionStorage.removeItem('pari.session');localStorage.removeItem('pari.session');(remember?localStorage:sessionStorage).setItem('pari.session',JSON.stringify({id:user.id,name:user.name,email:user.email,role:user.role}));},
    notify(p,type,title,body,tone='info') { if(p.preferences[type]?.inapp===false)return; p.notifications.unshift({id:uid('nt'),ts:new Date().toISOString().slice(0,19),type,title,body,tone,read:false,plant_id:this.plant});p.activity.unshift({id:uid('activity'),icon:type==='BREAKDOWN'?'breakdown':type==='REPEAT_FLAG'?'flag':'inspection',title,meta:body+' · just now',tone,plant_id:this.plant}); },
    scan(p) {
      if(this.server)return; // The server detects repeat failures transactionally.
      const groups=new Map();p.fleetBreakdowns.filter(b=>days(b.datetime_reported.slice(0,10))>=-p.thresholds.window).forEach(b=>{const k=b.crane_id+'|'+b.component.trim().toLowerCase();if(!groups.has(k))groups.set(k,[]);groups.get(k).push(b);});
      for(const list of groups.values()) {if(list.length<p.thresholds.count)continue;const b=list[0];let f=p.fleetRepeatFlags.find(f=>f.crane_id===b.crane_id&&f.component.toLowerCase()===b.component.toLowerCase()&&f.status!=='closed');const values={failures_120d:list.length,window_days:p.thresholds.window,total_downtime_min:list.reduce((s,b)=>s+b.downtime_min,0),est_loss_inr:list.reduce((s,b)=>s+b.impact_inr,0),timeline:list.slice().sort((a,b)=>a.datetime_reported.localeCompare(b.datetime_reported)).map(b=>({d:b.datetime_reported.slice(0,10),evt:b.symptom,downtime:b.downtime_min}))};if(f)Object.assign(f,values);else {f={id:uid('rf'),crane_id:b.crane_id,asset:b.asset,component:b.component,...values,first_seen:values.timeline[0].d,flagged_at:today(),assigned_to:'Reliability Manager',sla_hrs:p.thresholds.sla,status:'open',criticality:'A',five_why:[]};p.fleetRepeatFlags.unshift(f);this.notify(p,'REPEAT_FLAG','Repeat-failure flag: '+b.component,b.asset+' · '+list.length+' failures','danger');}}
    },
    async hash(password,salt) { const bytes=new TextEncoder().encode(salt+':'+password);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join(''); },
    files: {
      db() {return new Promise((resolve,reject)=>{const req=indexedDB.open(S.server?'pclm-files-'+window.PARI_LIVE.user()?.id:'pari-test-files',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});},
      async localPut(id,file) {const db=await this.db();await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();},
      async localGet(id) {const db=await this.db();const result=await new Promise((resolve,reject)=>{const req=db.transaction('files').objectStore('files').get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});db.close();return result;},
      async put(id,file) {await this.localPut(id,file);if(S.server){if(!navigator.onLine){window.PARI_LIVE.queueFile(id,file);return;}await window.PARI_LIVE.api('/api/files/'+id,file,'POST',{'Content-Type':file.type||'application/octet-stream','X-Filename':encodeURIComponent(file.name)});}},
      async get(id) {if(S.server&&navigator.onLine){const file=await window.PARI_LIVE.api('/api/files/'+id,null,'GET');await this.localPut(id,file);return file;}return this.localGet(id);},
      async remove(id) {if(S.server&&navigator.onLine)await window.PARI_LIVE.api('/api/files/'+id,{},'DELETE');const db=await this.db();await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
    }
  };
  S.derive();
  if(!data && !S.server) {try{localStorage.setItem(KEY,JSON.stringify(S.data));}catch{console.warn('Local storage unavailable. Saving requires browser storage.');}}
})();
