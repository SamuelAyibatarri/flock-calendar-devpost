import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ColorSchemeName;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const systemScheme = useColorScheme();

  const theme: ColorSchemeName =
    mode === 'system' ? (systemScheme ?? 'light') : mode;

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
