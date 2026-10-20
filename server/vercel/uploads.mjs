import {createHash} from 'node:crypto';
import {handleUpload} from '@vercel/blob/client';
import {account, secureWrite, body, json, statement} from '../runtime.mjs';
import {Problem, CUSTOMER, now} from '../model.mjs';
const MAX = 20 * 1024 * 1024;
function validateFile(f) {
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(f.id || '')) throw new Problem('Invalid file identifier.');
  if (typeof f.name !== 'string' || f.name.length > 240 || /[\\/]/.test(f.name) || !/^.+\.(pdf|png|jpe?g|webp|txt|csv|docx|xlsx)$/i.test(f.name)) throw new Problem('Unsupported filename or file type.');
  if (!Number.isInteger(f.size) || f.size <= 0 || f.size > MAX) throw new Problem('Choose a non-empty file up to 20 MB.',413);
  if (!/^[a-f0-9]{64}$/.test(f.sha256 || '')) throw new Problem('File checksum is required.');
}
async function ownedFile(env,u,id) {
  const row = await statement(env.DB,'SELECT data FROM pclm_files WHERE id=? AND workspace=?',id,u.workspace).first();
  if (!row) throw new Problem('File upload not found.',404);
  const f = JSON.parse(row.data);
  if (f.uploader !== u.id) throw new Problem('This upload belongs to another account.',403);
  return f;
}
export async function prepareUpload(request,env) {
  if(request.method!=='POST')throw new Problem('Use POST.',405);
  const u = await account(request,env); secureWrite(request,u);
  if (u.role === CUSTOMER) throw new Problem('Ask Pari to attach documents to your shared record.',403);
  const b = await body(request); validateFile(b);
  const existing = await statement(env.DB,'SELECT data,workspace FROM pclm_files WHERE id=?',b.id).first();
  if (existing) {
    const f=JSON.parse(existing.data);
    if (existing.workspace!==u.workspace || f.uploader!==u.id || f.sha256!==b.sha256 || f.size!==b.size || f.name!==b.name) throw new Problem('File identifier already exists.',409);
    return json({id:f.id,pathname:u.workspace+'/'+f.id,saved:f.status==='ready'});
  }
  const f={id:b.id,name:b.name,size:b.size,mime:String(b.mime||'application/octet-stream').slice(0,180),sha256:b.sha256,uploader:u.id,created:now(),status:'uploading'};
  await statement(env.DB,'INSERT INTO pclm_files(id,workspace,uploader,data) VALUES(?,?,?,?)',f.id,u.workspace,u.id,JSON.stringify(f)).run();
  return json({id:f.id,pathname:u.workspace+'/'+f.id,saved:false},201);
}
export async function finalizeUpload(request,env) {
  if(request.method!=='POST')throw new Problem('Use POST.',405);
  const u=await account(request,env); secureWrite(request,u); const {id}=await body(request),f=await ownedFile(env,u,id);
  if(f.status==='ready') return json(f);
  const object=await env.BUCKET.get(u.workspace+'/'+id);
  if(!object) throw new Problem('Upload has not completed. Retry the upload.',409);
  const bytes=new Uint8Array(await new Response(object.body).arrayBuffer());
  if(bytes.byteLength!==f.size || createHash('sha256').update(bytes).digest('hex')!==f.sha256) {
    await env.BUCKET.delete(u.workspace+'/'+id);
    throw new Problem('Uploaded bytes do not match the selected file. Retry the upload.',409);
  }
  f.status='ready';
  await statement(env.DB,'UPDATE pclm_files SET data=? WHERE id=? AND workspace=?',JSON.stringify(f),id,u.workspace).run();
  return json(f,201);
}
export async function authorizeUpload(verified,env,pathname) {
  const u=await account(verified,env);secureWrite(verified,u);
  if(u.role===CUSTOMER)throw new Problem('Document uploads require a Pari account.',403);
  const prefix=u.workspace+'/';if(!pathname.startsWith(prefix))throw new Problem('Upload is outside your workspace.',403);
  const f=await ownedFile(env,u,pathname.slice(prefix.length));
  if(f.status!=='uploading')throw new Problem('This original is already stored.',409);
  return {addRandomSuffix:false,allowOverwrite:false,maximumSizeInBytes:f.size,validUntil:Date.now()+10*60*1000,
    tokenPayload:JSON.stringify({id:f.id,member:u.id})};
}
export async function uploadToken(request,env,authenticatedRequest) {
  if(request.method!=='POST') return json({message:'Use POST.'},405);
  const data=await body(request);
  const result=await handleUpload({request,body:data,token:process.env.BLOB_READ_WRITE_TOKEN,
    onBeforeGenerateToken:async pathname=>authorizeUpload(await authenticatedRequest(),env,pathname),
    // The SDK verifies callback signatures. The browser finalization request
    // verifies original bytes and ownership before a record can reference them.
    onUploadCompleted:async()=>{},
  });
  return json(result);
}
