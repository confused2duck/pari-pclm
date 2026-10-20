import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
