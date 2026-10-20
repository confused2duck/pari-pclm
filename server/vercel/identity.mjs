import {Problem} from '../model.mjs';

export async function verifiedIdentity() {
  const {auth,currentUser}=await import('@clerk/nextjs/server');
  const session = await auth();
  if (!session.userId) return null;
  const user = await currentUser();
  const primary = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
  if (!primary || primary.verification?.status !== 'verified') throw new Problem('Verify your account email before opening PCLM.',403);
  return {id:session.userId,email:primary.emailAddress.toLowerCase(),name:user.fullName || primary.emailAddress};
}

// Internet-supplied Sites identity headers are never trusted on Vercel. Only
// inject an internal identity after Clerk has verified the actual session.
export function identityRequest(request, who) {
  const headers = new Headers(request.headers);
  for (const key of [...headers.keys()]) if (key.startsWith('oai-authenticated-user-')) headers.delete(key);
  if (who) {
    headers.set('oai-authenticated-user-id','clerk_'+who.id);
    headers.set('oai-authenticated-user-email',who.email);
    headers.set('oai-authenticated-user-full-name',encodeURIComponent(who.name));
    headers.set('oai-authenticated-user-full-name-encoding','percent-encoded-utf-8');
  }
  return new Request(request,{headers});
}
