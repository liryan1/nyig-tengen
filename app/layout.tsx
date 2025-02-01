import { Navbar } from "@/components/nav/Navbar";
import SessionProvider from "@/components/providers/SessionProvider";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
      <body className={`${font.className} antialiased`}>
        <SessionProvider session={session}>
          <ReduxProvider>
            <Navbar />
            <main className="mx-auto">{children}</main>
          </ReduxProvider>
        </SessionProvider>
        <Toaster
          containerStyle={{
            top: 70,
          }}
        />
      </body>
    </html>
  );
}
