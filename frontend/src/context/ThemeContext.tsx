import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from './AppContext';
import { darkTheme, lightTheme, setActiveTheme, ThemeColors, ThemeMode } from '../theme';
import { loadThemePreference } from '../services/themePreference';

type ThemeContextValue = { theme: ThemeColors; themeMode: ThemeMode; setThemeMode: (mode: ThemeMode) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'Dark' || value === 'System' || value === 'Light' ? value : 'Light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useApp();
  const systemScheme = useColorScheme();
  const storedMode = normalizeThemeMode(data?.settings.theme);
  const [themeMode, setThemeMode] = useState<ThemeMode>(storedMode);
  useEffect(() => { setThemeMode(storedMode); }, [storedMode]);
  useEffect(() => {
    let mounted = true;
    void loadThemePreference().then(mode => { if (mounted && mode) setThemeMode(mode); });
    return () => { mounted = false; };
  }, []);

  const theme = themeMode === 'System'
    ? systemScheme === 'dark' ? darkTheme : lightTheme
    : themeMode === 'Dark' ? darkTheme : lightTheme;
  useLayoutEffect(() => { setActiveTheme(theme); }, [theme]);
  const value = useMemo(() => ({ theme, themeMode, setThemeMode }), [theme, themeMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
