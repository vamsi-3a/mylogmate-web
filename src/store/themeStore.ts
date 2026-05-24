import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

function getInitialDark(): boolean {
  const stored = localStorage.getItem('mlm-theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(dark: boolean): void {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('mlm-theme', dark ? 'dark' : 'light');
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  // Apply initial theme immediately
  const initialDark = getInitialDark();
  applyTheme(initialDark);

  return {
    isDark: initialDark,

    toggle: () => {
      const next = !get().isDark;
      applyTheme(next);
      set({ isDark: next });
    },

    setDark: (dark) => {
      applyTheme(dark);
      set({ isDark: dark });
    },
  };
});
