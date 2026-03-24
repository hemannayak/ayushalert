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
             className="group flex items-center gap-2.5 bg-zinc-950/60 hover:bg-zinc-900/90 backdrop-blur-xl text-zinc-400 hover:text-zinc-100 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 border border-zinc-800/80 hover:border-zinc-700 shadow-lg"
           >
             <svg className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
             </svg>
             <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Portal</span>
           </a>
        </div>
      </body>
    </html>
  );
}
