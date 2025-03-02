import { AppSidebar } from "@/components/nav/root/AppSidebar";
import { NavHeader } from "@/components/nav/root/NavHeader";
import SessionProvider from "@/components/providers/SessionProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import ReduxProvider from "../components/providers/ReduxProvider";
import { authOptions } from "./api/auth/authOptions";
import "./globals.css";

const font = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "800"],
});

export const metadata: Metadata = {
  title: "NYIG Tengen",
  description:
    "Creating a broad and growing framework for the Game of Go in North America - a website for Go news, community, and guides.",
  authors: [{ name: "Ryan Li", url: "https://github.com/liryan1" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${font.className} antialiased`}>
        <SessionProvider session={session}>
          <ReduxProvider>
            <NuqsAdapter>
              <SidebarProvider>
                <AppSidebar />
                <NavHeader>{children}</NavHeader>
              </SidebarProvider>
            </NuqsAdapter>
          </ReduxProvider>
        </SessionProvider>
        <Toaster closeButton richColors duration={3000} />
      </body>
    </html>
  );
}
