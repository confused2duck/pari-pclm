export const requiredKeys = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY',
  'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'BLOB_READ_WRITE_TOKEN', 'PCLM_OWNER_EMAIL'];
export function missingConfiguration(env = process.env) {
  return requiredKeys.filter(key => !env[key]?.trim());
}
export function configurationResponse(missing) {
  const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  return new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>PCLM · Setup required</title><body style="background:#0A121C;color:#e8edf3;font:17px/1.7 system-ui;max-width:720px;margin:10vh auto;padding:24px"><h1>PCLM · Setup required</h1><p>The application build is installed. Connect the services below in this Vercel project's environment settings to enable the workspace.</p><ul>${missing.map(k => '<li><code>'+escape(k)+'</code></li>').join('')}</ul><p>Use Clerk for verified sign-in, Turso for records, and a <strong>private</strong> Vercel Blob store for originals. PCLM_OWNER_EMAIL identifies the administrator who may create the initial workspace.</p><p>Follow <a style="color:#d1b36a" href="https://github.com/confused2duck/pari-pclm/blob/main/VERCEL.md">the Vercel setup instructions</a>, apply the database schema, then redeploy. No demo login or temporary browser storage is enabled.</p></body></html>`, {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
