import {after} from 'next/server';
import {handleVercel} from '../../server/vercel/handler.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
function handle(request: Request) {
  return handleVercel(request,{waitUntil:(promise:Promise<unknown>)=>after(()=>promise)});
}
export {handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD};
