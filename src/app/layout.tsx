import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from 'next/headers';
import { PreferencesProvider } from '@/components/preferences';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Stack Overflow Clone",
    description: "A Stack Overflow-inspired question browser built with Next.js, TypeScript, and Tailwind CSS.",
    icons: {
        icon: '/icon.png'
    },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const preferences = await cookies();
    const locale = preferences.get('locale')?.value === 'uk' ? 'uk' : 'en';
    const theme = preferences.get('theme')?.value === 'dark' ? 'dark' : 'light';
    const currentYear = new Date().getFullYear();
    return (
        <html lang={locale} data-theme={theme}>
        <body className={`${geistSans.className} antialiased`}>
        <PreferencesProvider initialLocale={locale} initialTheme={theme}>
        <SiteHeader />

        <main className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
            {children}
        </main>

        <SiteFooter year={currentYear} />
        </PreferencesProvider>
        </body>
        </html>
    );
}
