import { createContext, useContext, useCallback, ReactNode, useState, useEffect } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme, ColorSchemeName, Platform, Appearance } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { setStyle as setNavigationBarStyle } from 'expo-navigation-bar';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ColorSchemeName;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const systemScheme = useRNColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  const theme: ColorSchemeName =
    mode === 'system' ? (colorScheme ?? systemScheme ?? 'light') : mode;

  useEffect(() => {
    const isDark = theme === 'dark';
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(isDark ? '#141414' : '#ffffff').catch(() => {});
      try {
        setNavigationBarStyle(isDark ? 'light' : 'dark');
      } catch {}
    }
  }, [theme]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setColorScheme(newMode);
    try {
      Appearance.setColorScheme(newMode === 'system' ? 'auto' : newMode);
    } catch {}
  }, [setColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
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
