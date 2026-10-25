import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, router as globalRouter } from 'expo-router';
import CustomTaskAdder from '@/components/CustomTaskAdder';
import Screen from '@/components/Screen';
import { loadFlock, type Batch } from '@/storage/store';
import { todayIso } from '@/lib/date';

export default function AddTaskScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    typeof params.batchId === 'string' ? params.batchId : '',
  );

  const paramDate = typeof params.date === 'string' ? params.date : todayIso();

  useEffect(() => {
    loadFlock().then((d) => {
      setBatches(d.batches);
      if (!selectedBatchId && d.batches.length > 0) {
        setSelectedBatchId(d.batches[0].id);
      }
      setLoading(false);
    });
  }, [selectedBatchId]);

  const goBack = () =>
    router.canGoBack() ? router.back() : globalRouter.replace('/');

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e6b800" />
        </View>
      </Screen>
    );
  }

  if (batches.length === 0) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-base font-semibold mb-2">
            No flock set up yet
          </Text>
          <Text className="text-muted-foreground text-sm text-center mb-4">
            Complete flock setup first before adding care tasks.
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-4 py-2"
            onPress={() => router.replace('/setup')}
          >
            <Text className="text-primary-foreground text-xs font-semibold">
              Go to setup
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const effectiveBatchId = selectedBatchId || batches[0].id;

  return (
    <CustomTaskAdder
      batchId={effectiveBatchId}
      initialDate={paramDate}
      batches={batches}
      onDone={goBack}
    />
  );
}
