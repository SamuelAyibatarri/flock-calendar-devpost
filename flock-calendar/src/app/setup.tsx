import Field from '@/components/Field';
import Screen from '@/components/Screen';
import { generateFlock, type SetupAnswers } from '@/schedule/build';
import { saveFlock } from '@/storage/store';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SetupScreen() {
  const router = useRouter();
  const [birdCount, setBirdCount] = useState('10');
  const [birdAgeDays, setBirdAgeDays] = useState('30');
  const [checkupsPerDay, setCheckupsPerDay] = useState('3');
  const [feedingsPerDay, setFeedingsPerDay] = useState('3');
  const [caretakerSchedule, setCaretakerSchedule] = useState<
    'student' | 'worker'
  >('worker');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const bc = parseInt(birdCount, 10);
    const age = parseInt(birdAgeDays, 10);
    const cp = parseInt(checkupsPerDay, 10);
    const fp = parseInt(feedingsPerDay, 10);

    if (!Number.isFinite(bc) || bc < 1) {
      setError('Bird count must be at least 1.');
      return;
    }
    if (!Number.isFinite(age) || age < 0 || age > 3650) {
      setError('Age must be a number of days between 0 and 3650.');
      return;
    }
    if (!Number.isFinite(cp) || cp < 1 || cp > 6) {
      setError('Checkups per day must be between 1 and 6.');
      return;
    }
    if (!Number.isFinite(fp) || fp < 1 || fp > 6) {
      setError('Feedings per day must be between 1 and 6.');
      return;
    }

    setError(null);
    setSaving(true);
    const answers: SetupAnswers = {
      birdType: 'layers',
      caretakerSchedule,
      birdCount: bc,
      birdAgeDays: age,
      checkupsPerDay: cp,
      feedingsPerDay: fp,
    };
    const { batches, rules } = generateFlock(answers);
    await saveFlock({ batches, rules, completions: [], notes: [] });
    router.replace('/');
  };

  const canGoBack = router.canGoBack();

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
          {canGoBack ? (
            <TouchableOpacity
              accessibilityLabel="Back"
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon weight="fill" size={18} color="#1a1a1a" />
            </TouchableOpacity>
          ) : (
            <View className="w-10 h-10" />
          )}
          <View className="flex-row items-center gap-2">
            <Image
              source={require('@/assets/images/icon.png')}
              className="w-9 h-9 rounded-2xl"
            />
            <Text className="text-foreground font-bold">Flock Calendar</Text>
          </View>
          <View className="w-10 h-10" />
        </View>

        <View className="px-5 mb-5">
          <Text className="text-foreground text-2xl font-bold tracking-tight">
            Set up your flock
          </Text>
          <Text className="text-muted-foreground text-sm mt-1">
            A few answers and we will build a care calendar around your birds
            and your day.
          </Text>
        </View>

        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <Text className="text-foreground text-sm font-semibold mb-4">
            About the birds
          </Text>

          <Field
            label="Bird count"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
            maxLength={5}
            suffix="birds"
          />
          <Field
            label="How long have they lived?"
            value={birdAgeDays}
            onChangeText={setBirdAgeDays}
            keyboardType="numeric"
            maxLength={4}
            suffix="days"
            hint="0 for chicks that just hatched."
          />
        </View>

        <View className="mx-4 mt-3 rounded-3xl border border-border bg-card p-4">
          <Text className="text-foreground text-sm font-semibold mb-4">
            Your routine
          </Text>

          <Field
            label="Checkups per day"
            value={checkupsPerDay}
            onChangeText={setCheckupsPerDay}
            keyboardType="numeric"
            maxLength={1}
            suffix="×"
          />
          <Field
            label="Feedings per day"
            value={feedingsPerDay}
            onChangeText={setFeedingsPerDay}
            keyboardType="numeric"
            maxLength={1}
            suffix="×"
          />

          <Text className="text-foreground text-sm font-medium mb-1.5">
            Your own schedule
          </Text>
          <View className="flex-row gap-2">
            {(['student', 'worker'] as const).map((option) => {
              const active = caretakerSchedule === option;
              return (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 rounded-xl border px-3 py-2.5 items-center ${
                    active
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  }`}
                  activeOpacity={0.7}
                  onPress={() => setCaretakerSchedule(option)}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      active
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="text-muted-foreground text-xs mt-2">
            We fit recurring tasks around the time you actually have.
          </Text>
        </View>

        {error && (
          <View className="mx-4 mt-3 rounded-xl bg-muted px-3 py-2.5 border border-destructive">
            <Text className="text-destructive text-xs font-medium">{error}</Text>
          </View>
        )}

        <View className="px-4 mt-5">
          <TouchableOpacity
            className={`rounded-full bg-primary py-3.5 items-center ${
              saving ? 'opacity-60' : ''
            }`}
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSubmit}
          >
            <Text className="text-primary-foreground text-sm font-bold">
              {saving ? 'Generating…' : 'Generate my calendar'}
            </Text>
          </TouchableOpacity>

          <Text className="text-muted-foreground text-[11px] text-center mt-3 px-6">
            Layers only for now · You can add more batches and custom tasks
            later.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
