'use client';
import {useEffect} from 'react';
import {useClerk} from '@clerk/nextjs';
export default function SignOut(){
  const {signOut}=useClerk();
  useEffect(()=>{void signOut({redirectUrl:'/auth/login.html'});},[signOut]);
  return <main style={{padding:'10vh 8vw'}}><h1>Signing out…</h1></main>;
}
