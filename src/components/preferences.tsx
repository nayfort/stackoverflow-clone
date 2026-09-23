'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { messages, type Locale, type Theme } from '@/lib/i18n';

const PreferencesContext = createContext<{
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
} | null>(null);

function savePreference(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export function PreferencesProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const [theme, updateTheme] = useState(initialTheme);

  function setLocale(value: Locale) {
    updateLocale(value);
    document.documentElement.lang = value;
    savePreference('locale', value);
  }

  function setTheme(value: Theme) {
    updateTheme(value);
    document.documentElement.dataset.theme = value;
    savePreference('theme', value);
  }

  return (
    <PreferencesContext.Provider value={{ locale, theme, setLocale, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('PreferencesProvider is required');
  return { ...context, t: messages[context.locale] };
}
