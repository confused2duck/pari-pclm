// Raw retained HTML pages need the provider's browser SDK to refresh the
// short-lived session cookie, just as ClerkProvider does on React pages.
export function clerkBrowserAssets(publishableKey=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  if(!publishableKey)return {origin:'',html:''};
  if(!/^pk_(test|live)_[A-Za-z0-9+/=_-]+$/.test(publishableKey))throw Error('Invalid Clerk publishable key.');
  const domain=Buffer.from(publishableKey.split('_').slice(2).join('_'),'base64').toString('utf8').replace(/\$$/,'');
  if(!/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(domain)||!domain.includes('.'))throw Error('Invalid Clerk frontend domain.');
  const origin='https://'+domain;
  const html=`<script defer crossorigin="anonymous" src="${origin}/npm/@clerk/ui@1.40.0/dist/ui.browser.js"></script><script defer crossorigin="anonymous" data-clerk-publishable-key="${publishableKey}" src="${origin}/npm/@clerk/clerk-js@6.39.0/dist/clerk.browser.js"></script><script>window.PARI_AUTH_READY=new Promise(function(resolve,reject){window.addEventListener('load',function(){if(!window.Clerk){reject(new Error('Account connection failed. Reload when the sign-in service is reachable.'));return;}window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}}).then(resolve,reject);},{once:true});});window.PARI_AUTH_READY.catch(function(){var el=document.querySelector('[data-sync-status]');if(el)el.textContent='Account connection failed · reload to retry';});</script>`;
  return {origin,html};
}
