import {spawnSync} from 'node:child_process';
for(const [file,environment] of [['tests/vercel.test.mjs',{}],['tests/runtime.test.mjs',{PCLM_TEST_DATABASE:'libsql'}]]) {
  const r=spawnSync(process.execPath,['--test',file],{stdio:'inherit',env:{...process.env,...environment}});
  if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);
}
