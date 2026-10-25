import { useTheme } from '@/context/ThemeContext';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type Props = {
  children: ReactNode;
  /** Hide the bottom inset for screens with their own footer. */
  edges?: 'top' | 'both';
};

export default function Screen({ children, edges = 'both' }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: edges === 'both' ? insets.bottom : 0,
      }}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
