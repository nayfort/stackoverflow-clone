'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePreferences } from './preferences';

const languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'uk', name: 'Українська', short: 'УК' },
] as const;

export function LanguagePicker() {
  const { locale, setLocale, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const selected = languages.findIndex((language) => language.code === locale);

  useEffect(() => {
    if (!open) return;
    options.current[selected]?.focus();
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, selected]);

  return (
    <div
      ref={root}
      className="language-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="preference-control language-trigger"
        aria-label={`${t.language}: ${languages[selected].name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" />
        </svg>
        <span>{languages[selected].short}</span>
        <svg
          className="language-chevron"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="language-menu"
          id={menuId}
          role="menu"
          aria-label={t.language}
          onKeyDown={(event) => {
            const index = options.current.findIndex((option) => option === document.activeElement);
            let next: number;
            if (event.key === 'ArrowDown') next = (index + 1) % languages.length;
            else if (event.key === 'ArrowUp')
              next = (index + languages.length - 1) % languages.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = languages.length - 1;
            else return;
            event.preventDefault();
            options.current[next]?.focus();
          }}
        >
          <p className="language-menu-label">{t.language}</p>
          {languages.map((language, index) => (
            <button
              key={language.code}
              ref={(element) => {
                options.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={locale === language.code}
              tabIndex={-1}
              className="language-option"
              onClick={() => {
                setLocale(language.code);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <span className="language-code">{language.short}</span>
              <span lang={language.code}>{language.name}</span>
              {locale === language.code && (
                <svg
                  className="language-check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
