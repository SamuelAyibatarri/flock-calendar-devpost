import BatchAdder from '@/components/BatchAdder';
import Screen from '@/components/Screen';
import { useTheme } from '@/context/ThemeContext';
import { getApiKeyStatus, setCustomApiKey } from '@/services/ai';
import {
  cancelDailyMorningReminder,
  isDailyReminderEnabled,
  scheduleDailyMorningReminder,
  triggerImmediateNotification,
} from '@/services/notifications';
import { loadFlock, type Batch } from '@/storage/store';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  BellRingingIcon,
  KeyIcon,
  PlusIcon,
  SparkleIcon,
} from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, theme, setMode } = useTheme();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ hasKey: boolean; isCustom: boolean; maskedKey?: string }>({
    hasKey: false,
    isCustom: false,
  });
  const [keyInput, setKeyInput] = useState('');
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(false);

  const reload = useCallback(() => {
    loadFlock().then((d) => {
      setBatches(d.batches);
    });
    getApiKeyStatus().then(setKeyStatus);
    isDailyReminderEnabled().then(setDailyReminder);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handleToggleDailyReminder = async () => {
    if (dailyReminder) {
      await cancelDailyMorningReminder();
      setDailyReminder(false);
      Alert.alert('Reminder Disabled', 'Morning 7:00 AM care notifications turned off.');
    } else {
      const success = await scheduleDailyMorningReminder(7, 0);
      if (success) {
        setDailyReminder(true);
        Alert.alert('Reminder Set!', 'You will receive a daily notification at 7:00 AM for due tasks.');
      } else {
        Alert.alert('Permission Required', 'Please allow notifications for Flock Calendar in your device settings.');
      }
    }
  };

  const handleTriggerTestNotification = async () => {
    const success = await triggerImmediateNotification(
      '🐓 Flock Care Alert',
      'Batch 1: Deworming Day 1 & Coop Cleaning due today (80 layers)!'
    );
    if (!success) {
      Alert.alert('Permission Denied', 'Please enable notifications for Flock Calendar in phone settings.');
    }
  };

  const handleSaveApiKey = async () => {
    if (!keyInput.trim()) {
      Alert.alert('Empty Key', 'Please paste your Gemini API key, or tap Cancel.');
      return;
    }
    await setCustomApiKey(keyInput.trim());
    setKeyInput('');
    setShowKeyEditor(false);
    await reload();
    Alert.alert('Key Saved', 'Your custom Gemini API key is now active for Flock AI.');
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Remove Custom Key',
      'Are you sure you want to remove your custom Gemini key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await setCustomApiKey('');
            await reload();
          },
        },
      ]
    );
  };

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

        {/* Flock AI Settings (Gemini BYOK) */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <SparkleIcon size={16} color="#f59e0b" weight="fill" />
              <Text className="text-foreground text-sm font-semibold">
                Flock AI (Gemini)
              </Text>
            </View>
            <View className="rounded-full bg-secondary/20 px-2 py-0.5">
              <Text className="text-secondary-foreground text-xs font-bold">
                {keyStatus.isCustom
                  ? 'Custom Key'
                  : keyStatus.hasKey
                  ? 'Default Key'
                  : 'Offline Mode'}
              </Text>
            </View>
          </View>

          <Text className="text-muted-foreground text-xs leading-relaxed mb-3">
            Flock AI uses Google Gemini to provide veterinary advice, dosage calculations, and schedule recovery routines.
          </Text>

          {keyStatus.maskedKey && (
            <View className="flex-row items-center justify-between py-2 border-t border-border/50 mb-2">
              <View className="flex-row items-center gap-1.5">
                <KeyIcon size={14} color="#f59e0b" weight="duotone" />
                <Text className="text-foreground text-xs font-mono">
                  {keyStatus.maskedKey}
                </Text>
              </View>
              {keyStatus.isCustom && (
                <TouchableOpacity onPress={handleClearApiKey}>
                  <Text className="text-destructive text-xs font-semibold">
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!showKeyEditor ? (
            <TouchableOpacity
              onPress={() => setShowKeyEditor(true)}
              className="rounded-xl border border-border bg-muted/40 py-2.5 px-3 items-center mt-1"
            >
              <Text className="text-foreground text-xs font-semibold">
                {keyStatus.isCustom ? 'Change API Key' : 'Add Custom Gemini API Key'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-2 pt-2 border-t border-border/50">
              <Text className="text-muted-foreground text-xs mb-1.5">
                Paste your Google Gemini API key:
              </Text>
              <TextInput
                value={keyInput}
                onChangeText={setKeyInput}
                placeholder="AIzaSy..."
                placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                className="rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs font-mono mb-2"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <View className="flex-row items-center gap-2 justify-end">
                <TouchableOpacity
                  onPress={() => {
                    setShowKeyEditor(false);
                    setKeyInput('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-muted"
                >
                  <Text className="text-muted-foreground text-xs font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-lg bg-secondary"
                >
                  <Text className="text-secondary-foreground text-xs font-bold">
                    Save Key
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Care Notifications */}
        <View className="mx-4 rounded-3xl border border-border bg-card p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <BellRingingIcon size={16} color="#f59e0b" weight="fill" />
              <Text className="text-foreground text-sm font-semibold">
                Care Notifications
              </Text>
            </View>
            <View className="rounded-full bg-secondary/20 px-2 py-0.5">
              <Text className="text-secondary-foreground text-xs font-bold">
                Local Device
              </Text>
            </View>
          </View>

          <Text className="text-muted-foreground text-xs leading-relaxed mb-3">
            Local alerts run directly on your phone clock without requiring internet or external push servers.
          </Text>

          {/* Daily 7:00 AM Reminder */}
          <View className="flex-row items-center justify-between py-2 border-t border-border/50">
            <View className="flex-1 pr-3">
              <Text className="text-foreground text-sm font-medium">Daily 7:00 AM Reminder</Text>
              <Text className="text-muted-foreground text-xs">Alerts you of tasks due each morning</Text>
            </View>
            <TouchableOpacity
              className={`w-12 h-6 rounded-full ${
                dailyReminder ? 'bg-primary' : 'bg-muted'
              }`}
              activeOpacity={0.7}
              onPress={handleToggleDailyReminder}
            >
              <View
                className={`w-4 h-4 rounded-full ${
                  dailyReminder ? 'bg-primary-foreground' : 'bg-muted-foreground'
                } absolute ${dailyReminder ? 'right-1' : 'left-1'} top-1`}
              />
            </TouchableOpacity>
          </View>

          {/* Test Trigger Button */}
          <TouchableOpacity
            onPress={handleTriggerTestNotification}
            className="rounded-xl border border-border bg-muted/40 py-2.5 px-3 items-center mt-2.5 flex-row justify-center gap-1.5"
            activeOpacity={0.8}
          >
            <BellIcon size={14} color="#f59e0b" weight="bold" />
            <Text className="text-foreground text-xs font-semibold">
              Trigger Test Care Alert Now
            </Text>
          </TouchableOpacity>
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
            <Text className="text-muted-foreground text-xs">Re-configure <ArrowRightIcon weight='bold' size={8} /></Text>
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
