import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cookies } from 'next/headers';
import { PreferencesProvider } from '@/components/preferences';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import { currentUser } from '@/lib/session';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stack Overflow Clone',
  description: 'A developer Q&A community with accounts, questions, answers, and shared solutions.',
  icons: {
    icon: '/icon.png',
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
  const user = await currentUser();
  const currentYear = new Date().getFullYear();
  return (
    <html lang={locale} data-theme={theme}>
      <body className={`${geistSans.className} antialiased`}>
        <PreferencesProvider initialLocale={locale} initialTheme={theme}>
          <SiteHeader user={user} />

          <main className="site-main">{children}</main>

          <SiteFooter year={currentYear} />
        </PreferencesProvider>
      </body>
    </html>
  );
}
