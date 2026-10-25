import Field from '@/components/Field';
import Screen from '@/components/Screen';
import { useTheme } from '@/context/ThemeContext';
import { generateFlock, type SetupAnswers } from '@/schedule/build';
import { loadFlock, saveFlock, type Batch } from '@/storage/store';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onDone: () => void;
};

export default function BatchAdder({ onDone }: Props) {
  const { theme } = useTheme();
  const [birdCount, setBirdCount] = useState('10');
  const [birdAgeDays, setBirdAgeDays] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const bc = parseInt(birdCount, 10);
    const age = parseInt(birdAgeDays, 10);

    if (!Number.isFinite(bc) || bc < 1) {
      setError('Bird count must be at least 1.');
      return;
    }
    if (!Number.isFinite(age) || age < 0 || age > 3650) {
      setError('Age must be a number of days between 0 and 3650.');
      return;
    }

    setError(null);
    setSaving(true);

    const data = await loadFlock();
    const nextNumber = data.batches.length + 1;
    const nextBatchId = `batch-${nextNumber}`;

    const now = new Date();
    const hatchDate = new Date(now);
    hatchDate.setUTCDate(now.getUTCDate() - age);
    const hatchDateISO = hatchDate.toISOString().split('T')[0];

    const batch: Batch = {
      id: nextBatchId,
      label: `Batch ${nextNumber}`,
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
      notes: data.notes,
    };
    await saveFlock(updated);
    onDone();
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={onDone}
        >
          <ArrowLeftIcon weight="bold" size={18} color={theme === 'dark' ? '#f5f5f5' : '#1a1a1a'} />
        </TouchableOpacity>
        <Text className="text-foreground font-bold">Add batch</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 mb-5">
          <Text className="text-foreground text-2xl font-bold tracking-tight">
            A new batch
          </Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Give us the count and age and we will schedule its care alongside
            the rest of the flock.
          </Text>
        </View>

        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <Field
            label="Bird count"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
            maxLength={5}
            suffix="birds"
          />
          <Field
            label="How long have they lived?"
            value={birdAgeDays}
            onChangeText={setBirdAgeDays}
            keyboardType="numeric"
            maxLength={4}
            suffix="days"
            hint="0 for chicks that just hatched."
          />
        </View>

        {error && (
          <View className="mx-4 mt-3 rounded-xl bg-muted px-3 py-2.5 border border-destructive">
            <Text className="text-destructive text-xs font-medium">{error}</Text>
          </View>
        )}

        <View className="px-4 mt-5">
          <TouchableOpacity
            className={`rounded-full bg-primary py-3.5 items-center ${
              saving ? 'opacity-60' : ''
            }`}
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleAdd}
          >
            <Text className="text-primary-foreground text-sm font-bold">
              {saving ? 'Adding…' : 'Add batch'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
