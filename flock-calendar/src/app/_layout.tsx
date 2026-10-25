import '@/global.css';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as RouterThemeProvider,
} from 'expo-router';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function ThemeStack() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
      <RouterThemeProvider value={isDark ? DarkTheme : DefaultTheme} key={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="day/[date]" />
          <Stack.Screen name="add-task" />
        </Stack>
      </RouterThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemeStack />
    </ThemeProvider>
  );
}
