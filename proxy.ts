import {clerkMiddleware} from '@clerk/nextjs/server';
import {NextResponse, type NextRequest, type NextFetchEvent} from 'next/server';
const clerk = clerkMiddleware();
export default function proxy(request:NextRequest,event:NextFetchEvent) {
  // A deploy without integrations shows the setup response, never an open app.
  if(!process.env.CLERK_SECRET_KEY||!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)return NextResponse.next();
  return clerk(request,event);
}
export const config = {matcher:[
  // HTML is intentionally included: the retained pages are protected routes.
  '/((?!_next|[^?]*\\.(?:css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  '/(api|trpc)(.*)',
]};
