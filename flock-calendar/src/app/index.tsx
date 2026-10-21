import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  loadFlock,
  type FlockData,
  type Rule,
  type Batch,
} from '@/storage/store';
import { isRuleDueOn } from '@/schedule/rules';

export default function CalendarScreen() {
  const router = useRouter();
  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlock().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && data && data.batches.length === 0) {
      router.replace('/setup');
    }
  }, [loading, data, router]);

  if (loading) {
    return (
      <View className="flex-1 bg-card justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const batches = data?.batches ?? [];
  const rules = data?.rules ?? [];
  const completions = data?.completions ?? [];

  // First-run gate: nothing configured yet -> go to setup
  if (batches.length === 0) {
    return null;
  }

  // Build dates: today + next 42 days
  const todayIso = new Date().toISOString().split('T')[0];
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i <= 42; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const tasksForDate = useCallback(
    (date: string) => {
      const due: Rule[] = [];
      for (const rule of rules) {
        const batch = batches.find((b) => b.id === rule.batchId);
        if (!batch) continue;
        if (!isRuleDueOn(rule, batch.hatchDate, date)) continue;
        const alreadyDone = completions.some(
          (c) => c.ruleId === rule.id && c.date === date,
        );
        if (alreadyDone) continue;
        due.push(rule);
      }
      return due;
    },
    [rules, batches, completions],
  );

  return (
    <View className="flex-1 bg-card p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-primary font-bold text-xl">Flock Calendar</Text>
          <Text className="text-muted-foreground">
            {batches.length} batch(es) tracked
          </Text>
        </View>
        <TouchableOpacity
          className="px-3 py-1.5 rounded border border-border"
          onPress={() => router.push('/setup')}
        >
          <Text className="text-sm text-foreground">Re-setup</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dates}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: date }) => {
          const due = tasksForDate(date);
          const d = new Date(date + 'T00:00:00');
          const label = d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          const isToday = date === todayIso;
          return (
            <TouchableOpacity
              key={date}
              className={`flex-row items-center justify-between p-3 rounded mb-2 ${
                isToday
                  ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                  : 'bg-background text-foreground border-border'
              }`}
              onPress={() => router.push(`/day/${date}`)}
            >
              <View className="flex-1">
                <Text className="font-medium">{label}</Text>
                <Text className="text-xs text-muted-foreground">{date}</Text>
              </View>
              <View className="flex-row gap-1">
                {due.map((r) => (
                  <Text
                    key={r.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground"
                  >
                    {r.title}
                  </Text>
                ))}
                {due.length === 0 && (
                  <Text className="text-[10px] text-muted-foreground">—</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
