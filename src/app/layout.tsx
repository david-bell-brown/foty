import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import Link from "next/link";
import { SignIn } from "~/components/signin-button";
import { UserMenu } from "~/components/user-menu";
import { auth } from "~/server/auth";

async function Nav() {
  const session = await auth();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 p-4">
      <Link href="/" className="text-xl">
        Foty
      </Link>
      {session ? <UserMenu user={session.user} /> : <SignIn />}
    </header>
  );
}

export const metadata: Metadata = {
  title: "Foty",
  description: "The world's most prestigious award",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex h-full min-h-svh flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
