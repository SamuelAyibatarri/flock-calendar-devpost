import { useLocalSearchParams, useRouter, router as globalRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import CustomTaskAdder from '@/components/CustomTaskAdder';
import Screen from '@/components/Screen';

export default function AddTaskScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const batchId = typeof params.batchId === 'string' ? params.batchId : '';
  const date = typeof params.date === 'string' ? params.date : undefined;

  const goBack = () =>
    router.canGoBack() ? router.back() : globalRouter.replace('/');

  if (!batchId) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-base font-semibold mb-2">
            No batch selected
          </Text>
          <Text className="text-muted-foreground text-sm text-center mb-4">
            Set up a batch first, then add care tasks to it.
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-4 py-2"
            onPress={goBack}
          >
            <Text className="text-primary-foreground text-xs font-semibold">
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <CustomTaskAdder batchId={batchId} initialDate={date} onDone={goBack} />
  );
}
