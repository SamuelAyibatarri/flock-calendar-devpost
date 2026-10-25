import Field from '@/components/Field';
import Screen from '@/components/Screen';
import { useTheme } from '@/context/ThemeContext';
import { formatShort, todayIso } from '@/lib/date';
import { addDays } from '@/schedule/rules';
import { loadFlock, saveFlock, type Rule } from '@/storage/store';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  batchId: string;
  initialDate?: string;
  onDone: () => void;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function CustomTaskAdder({
  batchId,
  initialDate,
  onDone,
}: Props) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = todayIso();
  const quickDates = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: addDays(today, 1) },
    { label: 'In 2 days', value: addDays(today, 2) },
  ];

  const handleAdd = async () => {
    if (!title.trim()) {
      setError('Give the task a name.');
      return;
    }
    if (!ISO_DATE.test(date)) {
      setError('Date must look like 2026-10-24.');
      return;
    }

    setError(null);
    setSaving(true);

    const data = await loadFlock();
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      batchId,
      kind: 'custom',
      title: title.trim(),
      dueDate: date,
    };
    await saveFlock({
      batches: data.batches,
      rules: [...data.rules, newRule],
      completions: data.completions,
      notes: data.notes,
    });
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
        <Text className="text-foreground font-bold">Add task</Text>
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
            One-off care task
          </Text>
          <Text className="text-muted-foreground text-sm mt-1">
            For anything the standard schedule does not cover.
          </Text>
        </View>

        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <Field
            label="Task"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Vitamin supplement"
            maxLength={60}
          />

          <Text className="text-foreground text-sm font-medium mb-1.5">
            Date
          </Text>
          <View className="flex-row gap-2 mb-2">
            {quickDates.map((quick) => {
              const active = date === quick.value;
              return (
                <TouchableOpacity
                  key={quick.value}
                  className={`flex-1 rounded-xl border px-2 py-2 items-center ${
                    active
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  }`}
                  activeOpacity={0.7}
                  onPress={() => setDate(quick.value)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      active ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {quick.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Field
            label="Or type a date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            hint={ISO_DATE.test(date) ? formatShort(date) : 'Use YYYY-MM-DD.'}
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
              {saving ? 'Adding…' : 'Add task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
