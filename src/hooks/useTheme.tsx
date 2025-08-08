
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force the app to always use light theme
  const [themeState, setThemeState] = useState<Theme>('light');
  const actualTheme: 'light' | 'dark' = 'light';

  useEffect(() => {
    // Persist light in case anything reads it
    try {
      localStorage.setItem('theme', 'light');
    } catch (_) {
      // ignore storage errors (SSR or private mode)
    }
    // Ensure no dark class is present on <html>
    document.documentElement.classList.remove('dark');
    // Do NOT add a 'light' class; Tailwind treats light as default
  }, []);

  const contextValue = useMemo<ThemeContextType>(() => ({
    theme: themeState,
    setTheme: () => {
      // No-op to prevent changing away from light
      setThemeState('light');
      try {
        localStorage.setItem('theme', 'light');
      } catch (_) {
        // ignore
      }
    },
    actualTheme,
  }), [themeState]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
