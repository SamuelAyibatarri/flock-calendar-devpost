import BatchAdder from '@/components/BatchAdder';
import Screen from '@/components/Screen';
import { useTheme } from '@/context/ThemeContext';
import { loadFlock, type Batch } from '@/storage/store';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeftIcon, PlusIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, theme, setMode } = useTheme();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [addBatchOpen, setAddBatchOpen] = useState(false);

  const reload = useCallback(() => {
    loadFlock().then((d) => {
      setBatches(d.batches);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

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

  const handleReset = () => {
    Alert.alert(
      'Re-setup flock',
      'This will take you to the setup screen to configure a fresh flock. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set up again', style: 'default', onPress: () => router.push('/setup') },
      ],
    );
  };

  const isDark = theme === 'dark';

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          accessibilityLabel="Back"
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <ArrowLeftIcon weight="bold" size={18} color={isDark ? '#f5f5f5' : '#1a1a1a'} />
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold tracking-tight">
          Settings
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4 mb-4">
          <Text className="text-foreground text-sm font-semibold mb-4">
            Appearance
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm">Dark mode</Text>
            <TouchableOpacity
              className={`w-12 h-6 rounded-full ${
                mode === 'dark' ? 'bg-primary' : 'bg-muted'
              }`}
              activeOpacity={0.7}
              onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            >
              <View
                className={`w-4 h-4 rounded-full ${
                  mode === 'dark' ? 'bg-primary-foreground' : 'bg-muted-foreground'
                } absolute ${mode === 'dark' ? 'right-1' : 'left-1'} top-1`}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Flock Batches */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-sm font-semibold">
              Tracked Batches
            </Text>
            <TouchableOpacity
              className="rounded-full bg-secondary px-3 py-1 flex-row items-center gap-1"
              onPress={() => setAddBatchOpen(true)}
            >
              <PlusIcon size={12} color="#1a1a1a" weight="bold" />
              <Text className="text-secondary-foreground text-xs font-bold">
                Add batch
              </Text>
            </TouchableOpacity>
          </View>

          {batches.map((batch) => (
            <View
              key={batch.id}
              className="flex-row items-center justify-between py-2.5 border-b border-border/50 last:border-b-0"
            >
              <View>
                <Text className="text-foreground text-sm font-medium">
                  {batch.label}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {batch.birdCount} layers · Hatched {batch.hatchDate}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Care Routine & Setup */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4 mb-4">
          <Text className="text-foreground text-sm font-semibold mb-3">
            Care Routine
          </Text>
          <TouchableOpacity
            className="py-2 flex-row items-center justify-between"
            onPress={handleReset}
          >
            <Text className="text-foreground text-sm">Run Setup Questionnaire Again</Text>
            <Text className="text-muted-foreground text-xs">Re-configure →</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4">
          <Text className="text-foreground text-sm font-semibold mb-3">
            About
          </Text>
          <Text className="text-muted-foreground text-sm mb-1">
            Flock Calendar v1.0.0
          </Text>
          <Text className="text-muted-foreground text-xs leading-relaxed">
            A care routine schedule generator for layer poultry farms. Built for Monday Samuel Chidera and multi-batch farmers.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
