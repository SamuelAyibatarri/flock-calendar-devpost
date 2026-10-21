import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { saveFlock, loadFlock, type Rule } from '@/storage/store';

type Props = {
  batchId: string;
  onDone: () => void;
};

export default function CustomTaskAdder({ batchId, onDone }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Invalid input', 'Enter a task title.');
      return;
    }
    const data = await loadFlock();
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      batchId,
      kind: 'custom',
      title: title.trim(),
      dueDate: date,
    };
    const updated = {
      batches: data.batches,
      rules: [...data.rules, newRule],
      completions: data.completions,
    };
    await saveFlock(updated);
    onDone();
  };

  return (
    <View className="flex-1 bg-card p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mb-4">
          <Text className="text-primary font-bold text-xl mb-2">Add custom task</Text>
          <Text className="text-muted-foreground text-sm">
            Add a one-off care task to a specific date.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Task title</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Vitamin supplement"
          />
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Date</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-secondary text-secondary-foreground font-medium py-3 rounded"
          onPress={handleAdd}
        >
          <Text className="text-center">Add task</Text>
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
