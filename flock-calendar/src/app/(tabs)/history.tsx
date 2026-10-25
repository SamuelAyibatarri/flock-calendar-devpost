import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import { useTheme } from '@/context/ThemeContext';
import { formatLong } from '@/lib/date';
import { loadFlock, type Completion, type Rule } from '@/storage/store';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const NO_COMPLETIONS: Completion[] = [];
const NO_RULES: Rule[] = [];

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [data, setData] = useState<{ batches: unknown[]; rules: Rule[]; completions: Completion[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFlock().then((d) => {
        setData(d);
        setLoading(false);
      });
    }, []),
  );

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading...</Text>
        </View>
      </Screen>
    );
  }

  const completions = data?.completions ?? NO_COMPLETIONS;
  const rules = data?.rules ?? NO_RULES;

  const grouped = completions.reduce<Record<string, Completion[]>>((acc, comp) => {
    if (!comp || !comp.date) return acc;
    if (!acc[comp.date]) acc[comp.date] = [];
    acc[comp.date].push(comp);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <ArrowLeftIcon weight="bold" size={18} color={theme === 'dark' ? '#f5f5f5' : '#1a1a1a'} />
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold tracking-tight">
          History
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {completions.length === 0 ? (
          <View className="mx-4 rounded-2xl border border-dashed border-border bg-card px-4 py-8 items-center">
            <Text className="text-foreground text-sm font-semibold">
              No history yet
            </Text>
            <Text className="text-muted-foreground text-xs mt-1 text-center">
              Tasks you check off will appear here.
            </Text>
          </View>
        ) : (
          sortedDates.map((date) => (
            <View key={date} className="mx-4 mb-6">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
                {formatLong(date)}
              </Text>
              {grouped[date].map((completion, idx) => {
                const rule = rules.find((r) => r.id === completion.ruleId);
                const instanceLabel =
                  completion.instanceIndex !== undefined
                    ? ` (Instance #${completion.instanceIndex + 1})`
                    : '';
                return (
                  <View
                    key={`${completion.ruleId}-${completion.date}-${completion.instanceIndex ?? 0}-${completion.doneAt ?? idx}-${idx}`}
                    className="mb-2"
                  >
                    <TaskRow
                      title={(rule?.title ?? 'Completed Task') + instanceLabel}
                      kind={rule?.kind ?? 'custom'}
                      checked
                      onToggle={() => {}}
                    />
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}