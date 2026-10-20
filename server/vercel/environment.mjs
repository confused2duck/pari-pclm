import {createClient} from '@libsql/client';
import {LibsqlDatabase} from './database.mjs';
import {PrivateBlobBucket} from './storage.mjs';
let environment;
export function getEnvironment() {
  if (!environment) {
    if (!/^(libsql|https):\/\//.test(process.env.TURSO_DATABASE_URL || '')) throw Error('Use a remote Turso database URL for Vercel.');
    environment = {
      DB: new LibsqlDatabase(createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN})),
      BUCKET: new PrivateBlobBucket(process.env.BLOB_READ_WRITE_TOKEN),
      PCLM_OWNER_EMAIL:process.env.PCLM_OWNER_EMAIL?.trim().toLowerCase(),
      PCLM_WEBHOOK_URL:process.env.PCLM_WEBHOOK_URL,
      PCLM_WEBHOOK_SECRET:process.env.PCLM_WEBHOOK_SECRET,
      STORAGE_LABEL:'Turso + private Vercel Blob',
    };
  }
  return environment;
}
