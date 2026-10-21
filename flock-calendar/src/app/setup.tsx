import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveFlock } from '@/storage/store';
import { generateFlock, type SetupAnswers } from '@/schedule/build';

export default function SetupScreen() {
  const router = useRouter();
  const [birdCount, setBirdCount] = useState('10');
  const [birdAgeDays, setBirdAgeDays] = useState('30');
  const [checkupsPerDay, setCheckupsPerDay] = useState('3');
  const [feedingsPerDay, setFeedingsPerDay] = useState('3');
  const [caretakerSchedule, setCaretakerSchedule] = useState<
    'student' | 'worker'
  >('worker');

  const handleSubmit = async () => {
    const bc = parseInt(birdCount, 10);
    const age = parseInt(birdAgeDays, 10);
    const cp = parseInt(checkupsPerDay, 10);
    const fp = parseInt(feedingsPerDay, 10);
    if (!bc || bc < 1 || age < 0 || cp < 1 || fp < 1) {
      Alert.alert('Invalid input', 'Please enter valid numbers for all fields.');
      return;
    }
    const answers: SetupAnswers = {
      birdType: 'layers',
      caretakerSchedule,
      birdCount: bc,
      birdAgeDays: age,
      checkupsPerDay: cp,
      feedingsPerDay: fp,
    };
    const { batches, rules } = generateFlock(answers);
    await saveFlock({ batches, rules, completions: [] });
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-primary-foreground p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="mb-6">
          <Text className="text-accent-foreground text-2xl font-bold mb-2">
            Flock setup
          </Text>
          <Text className="text-muted-foreground text-sm">
            Answer a few questions so we can generate your care calendar.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Bird count</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">
            How long have they lived? (days)
          </Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={birdAgeDays}
            onChangeText={setBirdAgeDays}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Checkups per day</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={checkupsPerDay}
            onChangeText={setCheckupsPerDay}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-foreground mb-1">Feedings per day</Text>
          <TextInput
            className="border border-border p-2 rounded bg-background"
            value={feedingsPerDay}
            onChangeText={setFeedingsPerDay}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-6">
          <Text className="text-foreground mb-1">Your schedule</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`px-3 py-2 rounded border ${
                caretakerSchedule === 'student'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'border-border text-foreground'
              }`}
              onPress={() => setCaretakerSchedule('student')}
            >
              <Text className="text-sm">Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-2 rounded border ${
                caretakerSchedule === 'worker'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'border-border text-foreground'
              }`}
              onPress={() => setCaretakerSchedule('worker')}
            >
              <Text className="text-sm">Worker</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-secondary text-secondary-foreground font-medium py-3 rounded"
          onPress={handleSubmit}
        >
          <Text className="text-center">Generate calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
