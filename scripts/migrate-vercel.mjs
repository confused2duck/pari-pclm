import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from '@libsql/client';
if(!process.env.TURSO_DATABASE_URL||!process.env.TURSO_AUTH_TOKEN)throw Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the linked Vercel project, then pull its environment.');
const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
try {
  if(!process.argv.includes('--apply')) {
    const tables=await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'pclm_%' ORDER BY name");
    console.log(JSON.stringify({mode:'read-only',tables:tables.rows.map(r=>r.name)}));
  } else {
    await client.execute('CREATE TABLE IF NOT EXISTS _pclm_migrations(name TEXT PRIMARY KEY, sha256 TEXT NOT NULL)');
    for(const file of (await readdir(new URL('../drizzle/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()) {
      const sql=await readFile(new URL('../drizzle/'+file,import.meta.url),'utf8');
      const sha=createHash('sha256').update(sql).digest('hex');
      const prior=await client.execute({sql:'SELECT sha256 FROM _pclm_migrations WHERE name=?',args:[file]});
      if(prior.rows.length) {if(prior.rows[0].sha256!==sha)throw Error('Applied migration was changed: '+file); continue;}
      await client.batch([...sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean),{sql:'INSERT INTO _pclm_migrations(name,sha256) VALUES(?,?)',args:[file,sha]}],'write');
      console.log('Applied '+file);
    }
  }
} finally {client.close();}
