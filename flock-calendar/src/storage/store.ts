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

export type FlockData = {
  batches: Batch[];
  rules: Rule[];
  completions: Completion[];
};

const emptyData: FlockData = { batches: [], rules: [], completions: [] };

export async function loadFlock(): Promise<FlockData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as FlockData;
    return {
      batches: parsed.batches ?? [],
      rules: parsed.rules ?? [],
      completions: parsed.completions ?? [],
    };
  } catch {
    return emptyData;
  }
}

export async function saveFlock(data: FlockData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
