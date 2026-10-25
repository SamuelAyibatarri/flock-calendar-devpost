import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import FlockAiModal from '@/components/FlockAiModal';
import { useTheme } from '@/context/ThemeContext';
import { formatLong, formatShort, todayIso } from '@/lib/date';
import { addDays, isRuleDueOn } from '@/schedule/rules';
import {
  addNote,
  deleteNote,
  getNotesForDate,
  loadFlock,
  saveFlock,
  updateNote,
  type Batch,
  type Completion,
  type FlockData,
  type Note,
  type Rule,
} from '@/storage/store';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon, PlusIcon, ShareNetworkIcon, SparkleIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const NO_BATCHES: Batch[] = [];
const NO_RULES: Rule[] = [];
const NO_COMPLETIONS: Completion[] = [];
const NO_NOTES: Note[] = [];

export default function DayListScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const { theme } = useTheme();
  const date = typeof params.date === 'string' ? params.date : todayIso();

  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Completion[]>(NO_COMPLETIONS);
  const [notes, setNotes] = useState<Note[]>(NO_NOTES);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');

  const reload = useCallback(() => {
    loadFlock().then((d) => {
      setData(d);
      setCompletions(d.completions);
      setNotes(getNotesForDate(d.notes, date));
      setLoading(false);
    });
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

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

  const getCompletedInstances = useCallback(
    (ruleId: string, day: string): number[] => {
      return completions
        .filter((c) => c.ruleId === ruleId && c.date === day)
        .map((c) => c.instanceIndex ?? 0);
    },
    [completions],
  );

  const isDone = useCallback(
    (rule: Rule, day: string) => {
      const times = rule.timesPerDay && rule.timesPerDay > 1 ? rule.timesPerDay : 1;
      const completed = getCompletedInstances(rule.id, day);
      return completed.length >= times;
    },
    [getCompletedInstances],
  );

  const toggleInstance = (ruleId: string, day: string, instanceIndex: number) => {
    if (!data) return;
    const exists = completions.some(
      (c) =>
        c.ruleId === ruleId &&
        c.date === day &&
        (c.instanceIndex ?? 0) === instanceIndex,
    );
    const updated = exists
      ? completions.filter(
          (c) =>
            !(
              c.ruleId === ruleId &&
              c.date === day &&
              (c.instanceIndex ?? 0) === instanceIndex
            ),
        )
      : [
          ...completions,
          {
            ruleId,
            date: day,
            doneAt: new Date().toISOString(),
            instanceIndex,
          },
        ];
    setCompletions(updated);
    saveFlock({ ...data, completions: updated });
  };

  const toggle = (rule: Rule, day: string) => {
    if (!data) return;
    const times = rule.timesPerDay && rule.timesPerDay > 1 ? rule.timesPerDay : 1;
    const completed = getCompletedInstances(rule.id, day);

    if (completed.length >= times) {
      const updated = completions.filter(
        (c) => !(c.ruleId === rule.id && c.date === day),
      );
      setCompletions(updated);
      saveFlock({ ...data, completions: updated });
    } else {
      let nextIdx = 0;
      for (let i = 0; i < times; i++) {
        if (!completed.includes(i)) {
          nextIdx = i;
          break;
        }
      }
      toggleInstance(rule.id, day, nextIdx);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    Keyboard.dismiss();
    await addNote(noteText.trim(), date);
    setNoteText('');
    setEditingNoteId(null);
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, date));
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            const d = await loadFlock();
            setNotes(getNotesForDate(d.notes, date));
          },
        },
      ],
    );
  };

  const handleEditNote = (id: string, currentText: string) => {
    setEditingNoteId(id);
    setNoteText(currentText);
  };

  const handleSaveEdit = async (id: string) => {
    if (!noteText.trim()) return;
    Keyboard.dismiss();
    await updateNote(id, noteText.trim());
    setNoteText('');
    setEditingNoteId(null);
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, date));
  };

  const today = todayIso();
  const selectedTasks = useMemo(() => dueFor(date), [dueFor, date]);

  const filteredSelectedTasks = useMemo(() => {
    if (selectedBatchFilter === 'all') return selectedTasks;
    return selectedTasks.filter((r) => r.batchId === selectedBatchFilter);
  }, [selectedTasks, selectedBatchFilter]);

  const pending = useMemo(
    () => filteredSelectedTasks.filter((r) => !isDone(r, date)),
    [filteredSelectedTasks, isDone, date],
  );
  const done = useMemo(
    () => filteredSelectedTasks.filter((r) => isDone(r, date)),
    [filteredSelectedTasks, isDone, date],
  );
  const isToday = date === today;

  // Next 7 upcoming days
  const upcomingDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(date, i + 1);
      const tasks = dueFor(d);
      return {
        date: d,
        tasks,
      };
    });
  }, [date, dueFor]);

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

  const addTask = () => {
    const batchId = data.batches[0]?.id;
    if (!batchId) {
      Alert.alert('No batch', 'Please set up a batch first before adding tasks.');
      return;
    }
    router.push(`/add-task?batchId=${batchId}&date=${date}`);
  };

  const handleShare = async () => {
    const taskLines = selectedTasks.map((r) => {
      const batch = batches.find((b) => b.id === r.batchId);
      const check = completions.some((c) => c.ruleId === r.id && c.date === date) ? '✓' : ' ';
      return `- [${check}] ${r.title}${batch ? ` (${batch.label})` : ''}`;
    });
    const textToShare = [
      `🐓 Flock Care Routine for ${formatLong(date)}:`,
      taskLines.length > 0 ? taskLines.join('\n') : '- No scheduled routine tasks today',
      notes.length > 0
        ? `\n📝 Farm Notes:\n${notes.map((n) => `- ${n.text}`).join('\n')}`
        : '',
      '\nTracked with Flock Calendar',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({ message: textToShare });
    } catch {}
  };

  const isDark = theme === 'dark';

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back to calendar"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <ArrowLeftIcon weight="bold" size={18} color={isDark ? '#f5f5f5' : '#1a1a1a'} />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            accessibilityLabel="Ask Flock AI"
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            onPress={() => setAiModalOpen(true)}
          >
            <SparkleIcon weight="fill" size={18} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Share Routine"
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            onPress={handleShare}
          >
            <ShareNetworkIcon weight="bold" size={18} color={isDark ? '#f5f5f5' : '#1a1a1a'} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Add a task"
            className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
            onPress={addTask}
          >
            <PlusIcon weight="bold" size={18} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 130 : 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
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

          {/* Batch Filter Pills if multiple batches exist */}
          {batches.length > 1 && (
            <View className="mx-4 mb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <TouchableOpacity
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedBatchFilter === 'all'
                      ? 'bg-primary border-primary'
                      : 'bg-muted border-border'
                  }`}
                  onPress={() => setSelectedBatchFilter('all')}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedBatchFilter === 'all'
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    All Batches ({selectedTasks.length})
                  </Text>
                </TouchableOpacity>

                {batches.map((batch) => {
                  const count = selectedTasks.filter((r) => r.batchId === batch.id).length;
                  const active = selectedBatchFilter === batch.id;
                  return (
                    <TouchableOpacity
                      key={batch.id}
                      className={`px-3 py-1.5 rounded-full border ${
                        active
                          ? 'bg-primary border-primary'
                          : 'bg-muted border-border'
                      }`}
                      onPress={() => setSelectedBatchFilter(batch.id)}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {batch.label} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Pending Tasks */}
          <View className="px-4">
            {pending.map((rule) => (
              <TaskRow
                key={rule.id}
                title={rule.title}
                kind={rule.kind}
                checked={false}
                onToggle={() => toggle(rule, date)}
                timesPerDay={rule.timesPerDay}
                completedInstances={getCompletedInstances(rule.id, date)}
                onToggleInstance={(idx) => toggleInstance(rule.id, date, idx)}
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
                    onToggle={() => toggle(rule, date)}
                    timesPerDay={rule.timesPerDay}
                    completedInstances={getCompletedInstances(rule.id, date)}
                    onToggleInstance={(idx) => toggleInstance(rule.id, date, idx)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Upcoming next 7 days */}
          <View className="mx-4 mt-8">
            <View className="mb-3">
              <Text className="text-foreground font-bold text-base">
                Upcoming care (next 7 days)
              </Text>
              <Text className="text-muted-foreground text-xs mt-0.5">
                Look ahead across all batches
              </Text>
            </View>

            {upcomingDays.map((up) => (
              <TouchableOpacity
                key={up.date}
                className="rounded-2xl border border-border bg-card p-3 mb-2 flex-row items-center justify-between"
                activeOpacity={0.7}
                onPress={() => router.push(`/day/${up.date}`)}
              >
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">
                    {formatLong(up.date)}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
                    {up.tasks.length === 0
                      ? 'No scheduled care'
                      : up.tasks.map((t) => t.title).slice(0, 3).join(' · ') +
                        (up.tasks.length > 3 ? ` +${up.tasks.length - 3} more` : '')}
                  </Text>
                </View>
                <View className="ml-3 items-end">
                  <View className="rounded-full bg-muted px-2.5 py-1">
                    <Text className="text-muted-foreground text-xs font-medium">
                      {up.tasks.length} {up.tasks.length === 1 ? 'task' : 'tasks'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes section per date */}
          <View className="mx-4 mt-8">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-foreground font-bold text-base">Notes for this date</Text>
            </View>
            <TextInput
              className="border border-border rounded-lg p-3 bg-background text-foreground min-h-[80px]"
              value={noteText}
              onChangeText={setNoteText}
              placeholder={editingNoteId ? 'Edit note…' : 'Add a note for this day…'}
              placeholderTextColor={isDark ? '#888888' : '#999999'}
              multiline
              numberOfLines={4}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }}
            />
            <View className="flex-row items-center gap-2 mt-2">
              <TouchableOpacity
                className={`flex-1 bg-primary px-4 py-2.5 rounded-xl items-center ${
                  !noteText.trim() ? 'opacity-50' : ''
                }`}
                activeOpacity={0.7}
                disabled={!noteText.trim()}
                onPress={() => (editingNoteId ? handleSaveEdit(editingNoteId) : handleAddNote())}
              >
                <Text className="text-primary-foreground text-sm font-semibold text-center">
                  {editingNoteId ? 'Save note' : 'Add note'}
                </Text>
              </TouchableOpacity>
              {editingNoteId && (
                <TouchableOpacity
                  className="px-3 py-2.5 rounded-xl bg-muted flex-row items-center gap-1.5"
                  onPress={() => {
                    setEditingNoteId(null);
                    setNoteText('');
                  }}
                  accessibilityLabel="Cancel editing"
                >
                  <XIcon size={14} color={isDark ? '#f5f5f5' : '#1a1a1a'} weight="bold" />
                  <Text className="text-muted-foreground text-xs font-semibold">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
            {notes.length === 0 ? (
              <View className="rounded-xl border border-dashed border-border bg-card px-4 py-4 mt-3 items-center">
                <Text className="text-muted-foreground text-sm text-center">
                  No notes for this day yet.
                </Text>
              </View>
            ) : (
              notes.map((note) => (
                <View
                  key={note.id}
                  className="flex-row items-center justify-between rounded-xl border border-border bg-card px-3 py-2 mt-2"
                >
                  <TouchableOpacity
                    onPress={() => handleEditNote(note.id, note.text)}
                    className="flex-1"
                  >
                    <Text className="text-foreground text-sm">{note.text}</Text>
                    <Text className="text-muted-foreground text-[10px] mt-0.5">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <TrashIcon size={16} color="#d41616" weight="fill" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FlockAiModal
        visible={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        batches={batches}
        onTasksAdded={reload}
      />
    </Screen>
  );
}
