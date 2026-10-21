import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { saveFlock, loadFlock, type Batch } from '@/storage/store';
import { generateFlock, type SetupAnswers } from '@/schedule/build';

type Props = {
  onDone: () => void;
};

export default function BatchAdder({ onDone }: Props) {
  const [birdCount, setBirdCount] = useState('10');
  const [birdAgeDays, setBirdAgeDays] = useState('30');

  const handleAdd = async () => {
    const bc = parseInt(birdCount, 10);
    const age = parseInt(birdAgeDays, 10);
    if (!bc || bc < 1 || age < 0) {
      Alert.alert('Invalid input', 'Enter valid bird count and age.');
      return;
    }

    const data = await loadFlock();
    const nextBatchId = `batch-${data.batches.length + 1}`;

    const now = new Date();
    const hatchDate = new Date(now);
    hatchDate.setUTCDate(now.getUTCDate() - age);
    const hatchDateISO = hatchDate.toISOString().split('T')[0];

    const batch: Batch = {
      id: nextBatchId,
      label: `Batch ${data.batches.length + 1}`,
      birdCount: bc,
      hatchDate: hatchDateISO,
    };

    const answers: SetupAnswers = {
      birdType: 'layers',
      caretakerSchedule: 'worker',
      birdCount: bc,
      birdAgeDays: age,
      checkupsPerDay: 3,
      feedingsPerDay: 3,
    };
    const { rules } = generateFlock(answers);
    // Re-map rules to the new batch id and unique ids
    const newRules = rules.map((r, i) => ({
      ...r,
      id: `rule-${Date.now()}-${i}`,
      batchId: nextBatchId,
    }));

    const updated = {
      batches: [...data.batches, batch],
      rules: [...data.rules, ...newRules],
      completions: data.completions,
    };
    await saveFlock(updated);
    onDone();
  };

  return (
    <View className="flex-1 bg-card p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mb-4">
          <Text className="text-primary font-bold text-xl mb-2">Add batch</Text>
          <Text className="text-muted-foreground text-sm">
            Add another flock batch at a different age.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Bird count</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">How long have they lived? (days)</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={birdAgeDays}
            onChangeText={setBirdAgeDays}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          className="w-full bg-secondary text-secondary-foreground font-medium py-3 rounded"
          onPress={handleAdd}
        >
          <Text className="text-center">Add batch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-border rounded py-2 mt-4 text-center"
          onPress={onDone}
        >
          <Text className="text-primary text-sm">Back to calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
