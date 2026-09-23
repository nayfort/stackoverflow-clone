'use client';

import { LanguagePicker } from './language-picker';
import { usePreferences } from './preferences';

export function PreferenceControls() {
    const { theme, setTheme, t } = usePreferences();
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const themeLabel = `${t.theme}: ${nextTheme === 'dark' ? t.dark : t.light}`;

    return (
        <div className="flex items-center gap-3">
            <button type="button" aria-label={themeLabel} title={themeLabel} onClick={() => setTheme(nextTheme)} className="preference-control theme-toggle">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {theme === 'light' ? (
                        <>
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                        </>
                    ) : (
                        <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z" />
                    )}
                </svg>
            </button>
            <LanguagePicker />
        </div>
    );
}
