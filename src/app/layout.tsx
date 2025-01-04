import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Nav from "../components/nav";

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
        <main className="flex flex-1">{children}</main>
      </body>
    </html>
  );
}
