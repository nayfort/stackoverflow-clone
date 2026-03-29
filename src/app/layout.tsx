import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Stack Overflow Clone",
    description: "Next.js 15, TypeScript, Tailwind",
    icons: {
        icon: '/icon.png'
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const currentYear = new Date().getFullYear();
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl text-slate-950 no-underline hover:text-blue-600 transition">
                    🚀 Stack<span className="text-orange-500">Overflow</span>
                </Link>
                <div className="flex gap-6 text-sm items-center">
                    <Link href="/" className="text-slate-600 hover:text-slate-900 no-underline transition">
                        My questions
                    </Link>
                    <Link
                        href="/"
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition no-underline"
                    >
                        Ask question
                    </Link>
                </div>
            </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
            {children}
        </main>

        <footer className="p-10 text-center text-slate-400 text-sm border-t mt-16 bg-white">
            Stack Overflow Clone | {currentYear}
        </footer>
        </body>
        </html>
    );
}
