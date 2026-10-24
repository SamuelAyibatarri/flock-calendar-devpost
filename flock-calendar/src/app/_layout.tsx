import '@/global.css';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as RouterThemeProvider,
} from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <RouterThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );
}
