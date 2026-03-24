import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AyushAlert",
  description: "A premium decentralized healthcare system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-50 min-h-screen selection:bg-indigo-500/30`}
        suppressHydrationWarning
      >
        {children}
        <div className="fixed top-6 right-6 z-50">
           <a 
             href="/" 
             className="bg-indigo-600/90 backdrop-blur-md hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition hover:scale-105 border border-indigo-400/50 flex items-center gap-2 text-sm tracking-wide"
           >
             🏠 Home Portal
           </a>
        </div>
      </body>
    </html>
  );
}
