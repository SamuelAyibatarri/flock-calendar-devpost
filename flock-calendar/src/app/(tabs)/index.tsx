import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import {
  loadFlock,
  saveFlock,
  type Batch,
  type Completion,
  type FlockData,
  type Rule,
} from '@/storage/store';
import { addDays, isRuleDueOn } from '@/schedule/rules';
import { formatShort, todayIso, weekdayInitial } from '@/lib/date';
import BatchAdder from '@/components/BatchAdder';
import MonthCalendar from '@/components/MonthCalendar';
import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import SetupScreen from '@/app/setup';

const NO_BATCHES: Batch[] = [];
const NO_RULES: Rule[] = [];
const NO_COMPLETIONS: Completion[] = [];

export default function CalendarScreen() {
  const router = useRouter();
  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Completion[]>(NO_COMPLETIONS);
  const [monthOffset, setMonthOffset] = useState(0);
  const [addBatchOpen, setAddBatchOpen] = useState(false);

  useEffect(() => {
    loadFlock().then((d) => {
      setData(d);
      setCompletions(d.completions);
      setLoading(false);
    });
  }, []);

  const batches = data?.batches ?? NO_BATCHES;
  const rules = data?.rules ?? NO_RULES;

  const dueFor = useCallback(
    (date: string): Rule[] => {
      const due: Rule[] = [];
      for (const rule of rules) {
        const batch = batches.find((b) => b.id === rule.batchId);
        if (!batch) continue;
        if (!isRuleDueOn(rule, batch.hatchDate, date)) continue;
        due.push(rule);
      }
      return due;
    },
    [rules, batches],
  );

  const isDone = useCallback(
    (ruleId: string, date: string) =>
      completions.some((c) => c.ruleId === ruleId && c.date === date),
    [completions],
  );

  const toggle = (ruleId: string, date: string) => {
    if (!data) return;
    const done = completions.some(
      (c) => c.ruleId === ruleId && c.date === date,
    );
    const updated = done
      ? completions.filter(
          (c) => !(c.ruleId === ruleId && c.date === date),
        )
      : [...completions, { ruleId, date, doneAt: new Date().toISOString() }];
    setCompletions(updated);
    saveFlock({ ...data, completions: updated });
  };

  const reload = () => {
    loadFlock().then((d) => {
      setData(d);
      setCompletions(d.completions);
    });
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1f5f42" />
        </View>
      </Screen>
    );
  }

  // First-run gate: nothing configured yet -> show setup directly
  if (batches.length === 0) {
    return <SetupScreen />;
  }

  if (addBatchOpen) {
    return (
      <BatchAdder
        onDone={() => {
          reload();
          setAddBatchOpen(false);
        }}
      />
    );
  }

  const today = todayIso();
  const todayTasks = dueFor(today);
  const pendingToday = todayTasks.filter((r) => !isDone(r.id, today));
  const doneToday = todayTasks.filter((r) => isDone(r.id, today));
  const totalBirds = batches.reduce((sum, b) => sum + b.birdCount, 0);

  const now = new Date();
  const monthAnchor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1),
  )
    .toISOString()
    .split('T')[0];

  const upcoming = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(today, i + 1);
    return { date, count: dueFor(date).length };
  });

  const activeBatchCount = `${batches.length} ${
    batches.length === 1 ? 'batch' : 'batches'
  } · ${totalBirds} birds`;

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center">
            <Text className="text-xl">🐔</Text>
          </View>
          <View>
            <Text className="text-foreground text-lg font-bold tracking-tight">
              Flock Calendar
            </Text>
            <Text className="text-muted-foreground text-xs">
              {activeBatchCount}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <MonthCalendar
            monthAnchor={monthAnchor}
            dueCount={(date) => dueFor(date).length}
            onPrevMonth={() => setMonthOffset((o) => o - 1)}
            onNextMonth={() => setMonthOffset((o) => o + 1)}
            onSelectDate={(date) => router.push(`/day/${date}`)}
          />
        </View>

        <View className="mx-4 mt-6">
          <View className="flex-row items-end justify-between mb-2">
            <Text className="text-foreground font-bold text-base">Today</Text>
            <TouchableOpacity onPress={() => router.push(`/day/${today}`)}>
              <Text className="text-primary text-xs font-semibold flex-row items-center gap-1">
                Open day
                <ArrowRight weight="fill" size={10} />
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-muted-foreground text-xs mb-3">
            {formatShort(today)}
            {pendingToday.length > 0
              ? ` · ${pendingToday.length} left`
              : ' · all caught up'}
          </Text>

          {pendingToday.map((rule) => (
            <TaskRow
              key={rule.id}
              title={rule.title}
              kind={rule.kind}
              checked={false}
              onToggle={() => toggle(rule.id, today)}
            />
          ))}

          {pendingToday.length === 0 && (
            <View className="rounded-2xl border border-dashed border-border bg-card px-4 py-5">
              <Text className="text-foreground text-sm font-medium">
                Nothing left for today 🎉
              </Text>
              <Text className="text-muted-foreground text-xs mt-1">
                Tap a date on the calendar to see what is coming.
              </Text>
            </View>
          )}

          {doneToday.length > 0 && (
            <View className="mt-3">
              <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide mb-2">
                Done today · {doneToday.length}
              </Text>
              {doneToday.map((rule) => (
                <TaskRow
                  key={rule.id}
                  title={rule.title}
                  kind={rule.kind}
                  checked
                  onToggle={() => toggle(rule.id, today)}
                />
              ))}
            </View>
          )}
        </View>

        <View className="mx-4 mt-6">
          <Text className="text-foreground font-bold text-base mb-2">
            Next 7 days
          </Text>
          <View className="flex-row gap-2">
            {upcoming.map(({ date, count }) => (
              <TouchableOpacity
                key={date}
                className="flex-1 items-center rounded-xl border border-border bg-card py-2"
                activeOpacity={0.7}
                onPress={() => router.push(`/day/${date}`)}
              >
                <Text className="text-[10px] text-muted-foreground font-medium">
                  {weekdayInitial(date)}
                </Text>
                <Text className="text-foreground text-sm font-semibold mt-0.5">
                  {date.slice(8, 10)}
                </Text>
                <View className="h-1.5 mt-1 flex-row items-center justify-center">
                  {count > 0 && (
                    <View className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
