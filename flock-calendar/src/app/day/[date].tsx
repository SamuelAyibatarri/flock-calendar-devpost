import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import { formatLong, formatShort, todayIso } from '@/lib/date';
import { isRuleDueOn } from '@/schedule/rules';
import {
  loadFlock,
  saveFlock,
  addNote,
  deleteNote,
  getNotesForDate,
  type Batch,
  type Completion,
  type FlockData,
  type Note,
  type Rule,
} from '@/storage/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'phosphor-react-native';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const date = typeof params.date === 'string' ? params.date : todayIso();

  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Completion[]>(NO_COMPLETIONS);
  const [notes, setNotes] = useState<Note[]>(NO_NOTES);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadFlock().then((d) => {
      setData(d);
      setCompletions(d.completions);
      setNotes(getNotesForDate(d.notes, date));
      setLoading(false);
    });
  }, [date]);

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

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(noteText.trim(), date);
    setNoteText('');
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, date));
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, date));
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
          <ArrowLeftIcon weight="bold" size={18} color="#1a1a1a" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Add a task"
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
          onPress={addTask}
        >
          <PlusIcon weight="bold" size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
          </View>

          {/* Notes section per date */}
          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-foreground font-bold text-base">Notes</Text>
            </View>
            <TextInput
              className="border border-border rounded-lg p-3 bg-background text-foreground min-h-[80px]"
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note for this day…"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              className="bg-primary mt-2 px-4 py-2 rounded-lg"
              activeOpacity={0.7}
              onPress={handleAddNote}
              disabled={!noteText.trim()}
            >
              <Text className="text-primary-foreground text-sm font-semibold">
                Add note
              </Text>
            </TouchableOpacity>
            {notes.length === 0 ? (
              <View className="rounded-xl border border-dashed border-border bg-card px-4 py-4 mt-2 items-center">
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
                  <View className="flex-1">
                    <Text className="text-foreground text-sm">{note.text}</Text>
                    <Text className="text-muted-foreground text-[10px] mt-0.5">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <TrashIcon size={16} color="#e6b800" weight="fill" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
