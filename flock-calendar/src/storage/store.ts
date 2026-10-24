import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'flock:v1';

export type Batch = {
  id: string;
  label: string;
  birdCount: number;
  hatchDate: string; // ISO date (YYYY-MM-DD)
};

export type RuleKind =
  | 'checkup'
  | 'feed'
  | 'water'
  | 'eggs'
  | 'cleaning'
  | 'vaccine'
  | 'deworm'
  | 'custom';

export type Rule = {
  id: string;
  batchId: string;
  kind: RuleKind;
  title: string;
  intervalDays?: number; // recurring every N days
  startOffsetDays?: number; // days after hatch when first due
  durationDays?: number; // multi-day task length
  timesPerDay?: number;
  dueDate?: string; // for custom one-off tasks: the exact date
};

export type Completion = {
  ruleId: string;
  date: string; // ISO date
  doneAt: string; // ISO timestamp
};

export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
};

export type FlockData = {
  batches: Batch[];
  rules: Rule[];
  completions: Completion[];
  notes: Note[];
};

const emptyData: FlockData = {
  batches: [],
  rules: [],
  completions: [],
  notes: [],
};

export async function loadFlock(): Promise<FlockData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as FlockData;
    return {
      batches: parsed.batches ?? [],
      rules: parsed.rules ?? [],
      completions: parsed.completions ?? [],
      notes: parsed.notes ?? [],
    };
  } catch {
    return emptyData;
  }
}

export async function saveFlock(data: FlockData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function addNote(text: string): Promise<void> {
  const data = await loadFlock();
  const note: Note = {
    id: `note-${Date.now()}`,
    text,
    createdAt: new Date().toISOString(),
  };
  await saveFlock({ ...data, notes: [...data.notes, note] });
}

export async function deleteNote(id: string): Promise<void> {
  const data = await loadFlock();
  await saveFlock({ ...data, notes: data.notes.filter((n) => n.id !== id) });
}
