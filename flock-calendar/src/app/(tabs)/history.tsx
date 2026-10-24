import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import { loadFlock, type Completion, type Rule } from '@/storage/store';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const NO_COMPLETIONS: Completion[] = [];
const NO_RULES: Rule[] = [];

export default function HistoryScreen() {
  const router = useRouter();
  const [data, setData] = useState<{ batches: unknown[]; rules: Rule[]; completions: Completion[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlock().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading…</Text>
        </View>
      </Screen>
    );
  }

  const completions = data?.completions ?? NO_COMPLETIONS;
  const rules = data?.rules ?? NO_RULES;

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => router.back()}
        >
          <ArrowLeftIcon weight="bold" size={18} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold tracking-tight">
          History
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {completions.length === 0 ? (
          <View className="mx-4 rounded-2xl border border-dashed border-border bg-card px-4 py-8 items-center">
            <Text className="text-3xl mb-2">📜</Text>
            <Text className="text-foreground text-sm font-semibold">
              No history yet
            </Text>
            <Text className="text-muted-foreground text-xs mt-1 text-center">
              Tasks you check off will appear here.
            </Text>
          </View>
        ) : (
          completions.map((completion, i) => {
            const rule = rules.find((r) => r.id === completion.ruleId);
            return (
              <View key={completion.ruleId + completion.date} className="mx-4 mb-3">
                <TaskRow
                  title={rule?.title ?? 'Task'}
                  kind={rule?.kind ?? 'custom'}
                  checked
                  onToggle={() => {}}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
