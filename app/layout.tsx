import type { Metadata } from "next";
import "./globals.css";
import {ClerkProvider} from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "PCLM · Pari Solutions",
  description: "Crane lifecycle management, engineering, maintenance and customer service.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY&&process.env.CLERK_SECRET_KEY
        ? <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">{children}</ClerkProvider>
        : children}</body>
    </html>
  );
}
