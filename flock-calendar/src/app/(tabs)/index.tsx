import SetupScreen from '@/app/setup';
import BatchAdder from '@/components/BatchAdder';
import FlockAiModal from '@/components/FlockAiModal';
import MonthCalendar from '@/components/MonthCalendar';
import Screen from '@/components/Screen';
import TaskRow from '@/components/TaskRow';
import { formatShort, todayIso } from '@/lib/date';
import { isRuleDueOn } from '@/schedule/rules';
import { generateBriefing } from '@/services/ai';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarBlankIcon, PlusIcon, SparkleIcon, TrashIcon } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const NO_BATCHES: Batch[] = [];
const NO_RULES: Rule[] = [];
const NO_COMPLETIONS: Completion[] = [];
const NO_NOTES: Note[] = [];

export default function CalendarScreen() {
  const router = useRouter();
  const [data, setData] = useState<FlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<Completion[]>(NO_COMPLETIONS);
  const [monthOffset, setMonthOffset] = useState(0);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(NO_NOTES);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const reload = useCallback(() => {
    loadFlock().then((d) => {
      setData(d);
      setCompletions(d.completions);
      setNotes(getNotesForDate(d.notes, todayIso()));
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

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

    const today = todayIso();
  const todayTasks = useMemo(() => dueFor(today), [dueFor, today]);
  const pendingToday = useMemo(() => 
    todayTasks.filter((r) => !isDone(r.id, today)), 
  [todayTasks, isDone, today]);
  const doneToday = useMemo(() => 
    todayTasks.filter((r) => isDone(r.id, today)), 
  [todayTasks, isDone, today]);

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

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(noteText.trim(), todayIso());
    setNoteText('');
    setEditingNoteId(null);
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, todayIso()));
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteNote(id);
          const d = await loadFlock();
          setNotes(getNotesForDate(d.notes, todayIso()));
        } },
      ],
    );
  };

  const handleEditNote = (id: string, currentText: string) => {
    setEditingNoteId(id);
    setNoteText(currentText);
  };

  const handleSaveEdit = async (id: string) => {
    if (!noteText.trim()) return;
    await updateNote(id, noteText.trim());
    setNoteText('');
    setEditingNoteId(null);
    const d = await loadFlock();
    setNotes(getNotesForDate(d.notes, todayIso()));
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1a1a1a" />
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


  const totalBirds = batches.reduce((sum, b) => sum + b.birdCount, 0);

  const now = new Date();
  const monthAnchor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1),
  )
    .toISOString()
    .split('T')[0];

  const activeBatchCount = `${batches.length} ${
    batches.length === 1 ? 'batch' : 'batches'
  } · ${totalBirds} birds`;

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <View className="flex-row items-center gap-3">
          <Image
            source={require('@/assets/images/icon.png')}
            className="w-11 h-11 rounded-2xl"
          />
          <View>
            <Text className="text-foreground text-lg font-bold tracking-tight">
              Flock Calendar
            </Text>
            <Text className="text-muted-foreground text-xs">
              {activeBatchCount}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="rounded-full bg-secondary px-3 py-1.5 flex-row items-center gap-1"
          activeOpacity={0.8}
          onPress={() => setAddBatchOpen(true)}
        >
          <PlusIcon size={14} color="#1a1a1a" weight="bold" />
          <Text className="text-secondary-foreground text-xs font-bold">
            Add batch
          </Text>
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
          {/* Flock AI Farm Briefing */}
          <View className="mx-4 mb-3.5 rounded-3xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="flex-row items-center gap-1.5">
                <SparkleIcon size={16} color="#f59e0b" weight="fill" />
                <Text className="text-foreground text-xs font-bold uppercase tracking-wider">
                  Flock AI Briefing
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAiModalOpen(true)}
                className="rounded-full bg-secondary px-2.5 py-1 flex-row items-center gap-1"
                activeOpacity={0.8}
              >
                <SparkleIcon size={12} color="#1a1a1a" weight="bold" />
                <Text className="text-secondary-foreground text-xs font-bold">
                  Ask AI Vet
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-muted-foreground text-xs leading-relaxed">
              {generateBriefing(batches, todayIso())}
            </Text>
          </View>

          <View className="mx-4 rounded-3xl border border-border bg-card p-4">
            <MonthCalendar
              monthAnchor={monthAnchor}
              dueCount={(date) => {
                const tasks = dueFor(date);
                return tasks.filter(
                  (t) =>
                    t.kind === 'vaccine' ||
                    t.kind === 'deworm' ||
                    t.kind === 'cleaning' ||
                    t.kind === 'custom',
                ).length;
              }}
              onPrevMonth={() => setMonthOffset((o) => o - 1)}
              onNextMonth={() => setMonthOffset((o) => o + 1)}
              onSelectDate={(date) => router.push(`/day/${date}`)}
            />
          </View>

          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-foreground font-bold text-base">Today</Text>
              <TouchableOpacity
                className="rounded-full bg-secondary px-2.5 py-1 flex-row items-center gap-1"
                activeOpacity={0.8}
                onPress={() => router.push(`/day/${today}`)}
              >
                <CalendarBlankIcon size={12} color="#1a1a1a" weight="bold" />
                <Text className="text-secondary-foreground text-xs font-bold">
                  Open day
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

          {/* Today's notes section */}
          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-foreground font-bold text-base">Notes for today</Text>
            </View>
            <TextInput
              className="border border-border rounded-lg p-3 bg-background text-foreground min-h-[80px]"
              value={noteText}
              onChangeText={setNoteText}
              placeholder={editingNoteId ? 'Edit note…' : 'Add a note for today…'}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              className={`bg-primary mt-2 px-4 py-2 rounded-lg ${
                !noteText.trim() ? 'opacity-50' : ''
              }`}
              activeOpacity={0.7}
              disabled={!noteText.trim()}
              onPress={() => editingNoteId ? handleSaveEdit(editingNoteId) : handleAddNote()}
            >
              <Text className="text-primary-foreground text-sm font-semibold">
                {editingNoteId ? 'Save note' : 'Add note'}
              </Text>
            </TouchableOpacity>
            {notes.length === 0 ? (
              <View className="rounded-xl border border-dashed border-border bg-card px-4 py-4 mt-2 items-center">
                <Text className="text-muted-foreground text-sm text-center">
                  No notes for today yet.
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
