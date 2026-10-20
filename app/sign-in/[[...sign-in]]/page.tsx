import {SignIn} from '@clerk/nextjs';
export const dynamic='force-dynamic';
export default function SignInPage(){
  if(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||!process.env.CLERK_SECRET_KEY)return <main style={{padding:'10vh 8vw'}}><h1>PCLM · Sign-in setup required</h1><p>Connect Clerk in the Vercel project and redeploy. See VERCEL.md.</p></main>;
  return <main style={{minHeight:'100vh',background:'#0A121C',display:'grid',placeItems:'center'}}><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/app/dashboard.html" /></main>;
}
