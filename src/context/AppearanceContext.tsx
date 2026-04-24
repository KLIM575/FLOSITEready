import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppearanceSettings, ColorTheme, FontPair } from '../types/index';
import { api } from '../services/api';

const COLOR_THEMES: Record<ColorTheme, Record<string, string>> = {
  rose: {
    '--p50': '#fdf4f5', '--p100': '#fce7eb', '--p200': '#f9d0d9',
    '--p300': '#f5a8b8', '--p400': '#ef7591', '--p500': '#e5446d',
    '--p600': '#d1285c', '--p700': '#b01d4d', '--p800': '#931b47', '--p900': '#7d1b42',
  },
  violet: {
    '--p50': '#f5f3ff', '--p100': '#ede9fe', '--p200': '#ddd6fe',
    '--p300': '#c4b5fd', '--p400': '#a78bfa', '--p500': '#8b5cf6',
    '--p600': '#7c3aed', '--p700': '#6d28d9', '--p800': '#5b21b6', '--p900': '#4c1d95',
  },
  blue: {
    '--p50': '#eff6ff', '--p100': '#dbeafe', '--p200': '#bfdbfe',
    '--p300': '#93c5fd', '--p400': '#60a5fa', '--p500': '#3b82f6',
    '--p600': '#2563eb', '--p700': '#1d4ed8', '--p800': '#1e40af', '--p900': '#1e3a8a',
  },
  emerald: {
    '--p50': '#ecfdf5', '--p100': '#d1fae5', '--p200': '#a7f3d0',
    '--p300': '#6ee7b7', '--p400': '#34d399', '--p500': '#10b981',
    '--p600': '#059669', '--p700': '#047857', '--p800': '#065f46', '--p900': '#064e3b',
  },
  amber: {
    '--p50': '#fffbeb', '--p100': '#fef3c7', '--p200': '#fde68a',
    '--p300': '#fcd34d', '--p400': '#fbbf24', '--p500': '#f59e0b',
    '--p600': '#d97706', '--p700': '#b45309', '--p800': '#92400e', '--p900': '#78350f',
  },
};

const FONT_PAIRS: Record<FontPair, { heading: string; body: string }> = {
  default:  { heading: 'Playfair Display', body: 'Inter' },
  modern:   { heading: 'Montserrat',       body: 'Roboto' },
  classic:  { heading: 'Cormorant Garamond', body: 'EB Garamond' },
  minimal:  { heading: 'DM Sans',          body: 'DM Sans' },
};

const DEFAULT_SETTINGS: AppearanceSettings = {
  colorTheme: 'rose',
  fontPair: 'default',
  logoUrl: '',
  faviconUrl: '',
  bannerBgImage: '',
  bannerBgColor: '',
  bannerButtonText: '',
  bannerButtonLink: '',
  darkModeEnabled: false,
  catalogColumns: '3',
  productCardStyle: 'default',
  footerCopyright: '',
};

/** Удаляет поля снятой настройки «кнопки» из старых сохранений. */
function stripLegacyAppearance<T extends Record<string, unknown>>(obj: T): T {
  const next = { ...obj };
  delete next.buttonStyle;
  delete next.buttonShadow;
  return next;
}

const STORAGE_KEY = 'appearance_settings';

interface AppearanceContextType {
  appearance: AppearanceSettings;
  loading: boolean;
  updateAppearance: (settings: AppearanceSettings) => Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

function applySettings(settings: AppearanceSettings) {
  const root = document.documentElement;

  // Colors
  const theme = COLOR_THEMES[settings.colorTheme] ?? COLOR_THEMES.rose;
  Object.entries(theme).forEach(([key, value]) => root.style.setProperty(key, value));

  // Fonts
  const fonts = FONT_PAIRS[settings.fontPair] ?? FONT_PAIRS.default;
  root.style.setProperty('--font-heading', `'${fonts.heading}'`);
  root.style.setProperty('--font-body', `'${fonts.body}'`);

  // Dark mode
  root.classList.toggle('dark-mode', settings.darkModeEnabled);

  document.body.classList.remove('btn-pill', 'btn-square', 'btn-shadow');

  // Favicon
  if (settings.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }
}

export const AppearanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? { ...DEFAULT_SETTINGS, ...stripLegacyAppearance(JSON.parse(raw) as Record<string, unknown>) }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(true);

  // Apply cached settings immediately on mount (no flash)
  useEffect(() => {
    applySettings(appearance);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Then fetch authoritative values from backend
  useEffect(() => {
    api.appearance.get()
      .then(data => {
        const merged = {
          ...DEFAULT_SETTINGS,
          ...stripLegacyAppearance(data as unknown as Record<string, unknown>),
        };
        setAppearance(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        applySettings(merged);
      })
      .catch(() => {
        // Keep localStorage values if backend is unreachable
      })
      .finally(() => setLoading(false));
  }, []);

  const updateAppearance = useCallback(async (settings: AppearanceSettings) => {
    // Apply immediately for instant feedback
    setAppearance(settings);
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Persist to backend
    await api.appearance.update(settings);
  }, []);

  return (
    <AppearanceContext.Provider value={{ appearance, loading, updateAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider');
  return ctx;
};

export { COLOR_THEMES, FONT_PAIRS };
