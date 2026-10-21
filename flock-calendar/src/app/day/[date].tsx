import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function DayRoute() {
  const { date } = useLocalSearchParams() as { date: string };
  const router = useRouter();

  return (
    <View className="flex-1 bg-card p-4">
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.back()}
      >
        <Text className="text-primary text-sm">← Back to calendar</Text>
      </TouchableOpacity>
      <View className="mb-2">
        <Text className="text-primary font-bold text-xl">{date}</Text>
        <Text className="text-muted-foreground text-sm">Task list</Text>
      </View>
      <Text className="text-muted-foreground">
        Checking off tasks lands here next.
      </Text>
    </View>
  );
}
