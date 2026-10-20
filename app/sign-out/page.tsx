import SignOut from './sign-out';
export const dynamic='force-dynamic';
export default function Page(){return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?<SignOut/>:<main>Sign-in is not configured.</main>;}
