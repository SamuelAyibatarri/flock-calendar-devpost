import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useTheme();

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => router.back()}
        >
          <ArrowLeft weight="fill" size={18} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold tracking-tight">
          Settings
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <Text className="text-foreground text-sm font-semibold mb-4">
            Appearance
          </Text>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-sm">Dark mode</Text>
            <TouchableOpacity
              className={`w-12 h-6 rounded-full ${
                mode === 'dark' ? 'bg-primary' : 'bg-muted'
              }`}
              activeOpacity={0.7}
              onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            >
              <View
                className={`w-4 h-4 rounded-full ${
                  mode === 'dark' ? 'bg-primary-foreground' : 'bg-muted-foreground'
                } absolute ${mode === 'dark' ? 'right-1' : 'left-1'} top-1`}
              />
            </TouchableOpacity>
          </View>

          <Text className="text-foreground text-sm font-semibold mb-4 mt-4">
            About
          </Text>
          <Text className="text-muted-foreground text-sm mb-2">
            Flock Calendar v1.0.0
          </Text>
          <Text className="text-muted-foreground text-sm">
            Layer-farm care calendar for batches of laying hens.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
