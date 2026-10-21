import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  loadFlock,
  saveFlock,
  type FlockData,
  type Rule,
  type Batch,
  type Completion,
} from '@/storage/store';
import { addDays, isRuleDueOn } from '@/schedule/rules';
import TaskRow from '@/components/TaskRow';

export default function DayListScreen() {
  const { date: dateParam } = useLocalSearchParams() as { date: string };
  const router = useRouter();
  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlock().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-card justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!data) return null;

  const batches = data.batches;
  const rules = data.rules;
  const [completions, setCompletions] = useState<Completion[]>(data.completions);

  // 8-day window: selected date + next 7 days
  const windowDates: string[] = [];
  const base = new Date(dateParam + 'T00:00:00Z');
  for (let i = 0; i < 8; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    windowDates.push(d.toISOString().split('T')[0]);
  }

  const tasksForDate = useCallback(
    (date: string) => {
      const due: { rule: Rule; batch: Batch }[] = [];
      for (const rule of rules) {
        const batch = batches.find((b) => b.id === rule.batchId);
        if (!batch) continue;
        if (!isRuleDueOn(rule, batch.hatchDate, date)) continue;
        const alreadyDone = completions.some(
          (c) => c.ruleId === rule.id && c.date === date,
        );
        if (alreadyDone) continue;
        due.push({ rule, batch });
      }
      return due;
    },
    [rules, batches, completions],
  );

  const handleCheck = (ruleId: string, date: string) => {
    if (completions.some((c) => c.ruleId === ruleId && c.date === date)) return;
    const next: Completion = { ruleId, date, doneAt: new Date().toISOString() };
    const updated = [...completions, next];
    setCompletions(updated);
    saveFlock({ ...data, completions: updated });
  };

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <View className="flex-1 bg-card p-4">
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.push('/')}
      >
        <Text className="text-primary text-sm">← Back to calendar</Text>
      </TouchableOpacity>

      <View className="mb-2">
        <Text className="text-primary font-bold text-xl">{dateParam}</Text>
        <Text className="text-muted-foreground text-sm">
          Tasks due today and over the next 7 days
        </Text>
      </View>

      {windowDates.map((date) => {
        const due = tasksForDate(date);
        const d = new Date(date + 'T00:00:00Z');
        const label = d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const isToday = date === todayIso;
        return (
          <View key={date} className="mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className={`font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </Text>
              {due.length > 0 && (
                <Text className="text-xs font-medium text-primary">
                  {due.length} due
                </Text>
              )}
            </View>
            {due.length === 0 ? (
              <Text className="text-xs text-muted-foreground ml-2 mb-2">
                Nothing due
              </Text>
            ) : (
              due.map(({ rule }) => (
                <TaskRow
                  key={rule.id + '|' + date}
                  title={rule.title}
                  checked={completions.some(
                    (c) => c.ruleId === rule.id && c.date === date,
                  )}
                  onToggle={() => handleCheck(rule.id, date)}
                />
              ))
            )}
          </View>
        );
      })}
    </View>
  );
}
