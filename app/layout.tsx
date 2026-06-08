import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TailorOS | Enterprise Bespoke Engine",
  description: "Advanced management layout for modern production fashion ateliers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      {/* No Sidebar here! 
        This allows your public landing page (app/page.tsx) to take up the full screen.
      */}
      <body className={`${inter.className} bg-[#050505] text-neutral-200 antialiased selection:bg-indigo-500/30 overflow-x-hidden min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}