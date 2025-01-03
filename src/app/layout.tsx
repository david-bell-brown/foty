import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

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
      <body className="">
        <SidebarProvider>
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b p-4">
              <div className="text-xl">Foty</div>
              <SidebarTrigger />
            </header>
            {children}
          </SidebarInset>
          <AppSidebar />
        </SidebarProvider>
      </body>
    </html>
  );
}
