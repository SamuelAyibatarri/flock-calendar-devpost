import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ArrowRight, Plus } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  loadFlock,
  saveFlock,
  type Batch,
  type Completion,
  type FlockData,
  type Rule,
} from '@/storage/store';
import { addDays, isRuleDueOn } from '@/schedule/rules';
import { formatLong, formatShort, todayIso } from '@/lib/date';
import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';

const NO_BATCHES: Batch[] = [];
const NO_RULES: Rule[] = [];
const NO_COMPLETIONS: Completion[] = [];

export default function DayListScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const date = typeof params.date === 'string' ? params.date : todayIso();

  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Completion[]>(NO_COMPLETIONS);

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
    (day: string): Rule[] => {
      const due: Rule[] = [];
      for (const rule of rules) {
        const batch = batches.find((b) => b.id === rule.batchId);
        if (!batch) continue;
        if (!isRuleDueOn(rule, batch.hatchDate, day)) continue;
        due.push(rule);
      }
      return due;
    },
    [rules, batches],
  );

  const isDone = useCallback(
    (ruleId: string, day: string) =>
      completions.some((c) => c.ruleId === ruleId && c.date === day),
    [completions],
  );

  const toggle = (ruleId: string, day: string) => {
    if (!data) return;
    const done = completions.some(
      (c) => c.ruleId === ruleId && c.date === day,
    );
    const updated = done
      ? completions.filter((c) => !(c.ruleId === ruleId && c.date === day))
      : [...completions, { ruleId, date: day, doneAt: new Date().toISOString() }];
    setCompletions(updated);
    saveFlock({ ...data, completions: updated });
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e6b800" />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-muted-foreground">No flock data yet.</Text>
        </View>
      </Screen>
    );
  }

  const today = todayIso();
  const selectedTasks = dueFor(date);
  const pending = selectedTasks.filter((r) => !isDone(r.id, date));
  const done = selectedTasks.filter((r) => isDone(r.id, date));
  const isToday = date === today;

  const upcoming = Array.from({ length: 7 })
    .map((_, i) => {
      const day = addDays(date, i + 1);
      return { day, tasks: dueFor(day) };
    })
    .filter((entry) => entry.tasks.length > 0);

  const addTask = () => {
    const batchId = data.batches[0]?.id;
    if (!batchId) return;
    router.push(`/add-task?batchId=${batchId}&date=${date}`);
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back to calendar"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <ArrowLeft weight="fill" size={18} color="#1a1a1a" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Add a task"
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
          onPress={addTask}
        >
          <Plus weight="fill" size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              {formatShort(date)}
            </Text>
            {isToday && (
              <View className="rounded-full bg-secondary px-2 py-0.5">
                <Text className="text-secondary-foreground text-[10px] font-bold">
                  TODAY
                </Text>
              </View>
            )}
          </View>
          <Text className="text-foreground text-2xl font-bold tracking-tight">
            {formatLong(date)}
          </Text>
          <Text className="text-muted-foreground text-xs mt-1">
            {pending.length === 0
              ? 'Everything here is done'
              : `${pending.length} ${
                  pending.length === 1 ? 'task' : 'tasks'
                } still to do`}
          </Text>
        </View>

        <View className="px-4">
          {pending.map((rule) => (
            <TaskRow
              key={rule.id}
              title={rule.title}
              kind={rule.kind}
              checked={false}
              onToggle={() => toggle(rule.id, date)}
            />
          ))}

          {selectedTasks.length === 0 && (
            <View className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 items-center">
              <Text className="text-3xl mb-2">🌿</Text>
              <Text className="text-foreground text-sm font-semibold">
                Nothing scheduled
              </Text>
              <Text className="text-muted-foreground text-xs text-center mt-1 mb-4">
                This day is clear. Add your own care task if the flock needs
                something.
              </Text>
              <TouchableOpacity
                className="rounded-full bg-primary px-4 py-2"
                onPress={addTask}
              >
                <Text className="text-primary-foreground text-xs font-semibold">
                  Add a task
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {done.length > 0 && (
            <View className="mt-4">
              <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide mb-2">
                Done · {done.length}
              </Text>
              {done.map((rule) => (
                <TaskRow
                  key={rule.id}
                  title={rule.title}
                  kind={rule.kind}
                  checked
                  onToggle={() => toggle(rule.id, date)}
                />
              ))}
            </View>
          )}

          <View className="mt-6">
            <Text className="text-foreground font-bold text-base mb-1">
              Next 7 days
            </Text>

            {upcoming.length === 0 && (
              <View className="mt-2 rounded-2xl border border-border bg-card px-4 py-4">
                <Text className="text-muted-foreground text-xs">
                  Nothing else scheduled in the next 7 days.
                </Text>
              </View>
            )}

            {upcoming.map(({ day, tasks }) => {
              const remaining = tasks.filter((r) => !isDone(r.id, day)).length;
              return (
                <View
                  key={day}
                  className="mt-3 rounded-2xl border border-border bg-card p-3"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={() => router.push(`/day/${day}`)}
                    >
                      <Text className="text-foreground text-sm font-semibold">
                        {formatShort(day)}
                      </Text>
                      <Text className="text-muted-foreground text-[10px]">
                        {remaining === 0 ? 'all done' : `${remaining} to do`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/day/${day}`)}>
                      <Text className="text-primary text-[11px] font-semibold flex-row items-center gap-2">
                        Open
                        <ArrowRight weight="fill" size={9} />
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {tasks.map((rule) => (
                    <TaskRow
                      key={rule.id}
                      title={rule.title}
                      kind={rule.kind}
                      checked={isDone(rule.id, day)}
                      onToggle={() => toggle(rule.id, day)}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
