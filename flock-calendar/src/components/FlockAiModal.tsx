import { useTheme } from '@/context/ThemeContext';
import { formatShort, todayIso } from '@/lib/date';
import { addDays } from '@/schedule/rules';
import { askFlockAi, type AiConsultationResult } from '@/services/ai';
import { addMultipleRules, type Batch, type Rule } from '@/storage/store';
import { CalendarPlusIcon, CheckCircleIcon, PillIcon, SparkleIcon, XIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  batches: Batch[];
  onTasksAdded: () => void;
};

const SUGGESTED_CHIPS = [
  'Deworming dosage & protocol for my flock',
  'Sudden drop in egg production',
  'Newcastle Lasota vaccine booster guide',
  'Heat stress & water management tips',
];

export default function FlockAiModal({
  visible,
  onClose,
  batches,
  onTasksAdded,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const today = todayIso();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        try {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch {}
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        try {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch {}
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiConsultationResult | null>(null);
  const [added, setAdded] = useState(false);

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk ?? query).trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    setAdded(false);

    try {
      const res = await askFlockAi(q, batches, today);
      setResult(res);
    } catch {
      Alert.alert('Error', 'Unable to get advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!result || result.suggestedTasks.length === 0) return;

    const defaultBatchId = batches[0]?.id ?? 'default';
    const newRules: Rule[] = result.suggestedTasks.map((t, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      batchId: defaultBatchId,
      kind: t.kind,
      title: t.title,
      dueDate: addDays(today, t.daysFromNow),
    }));

    await addMultipleRules(newRules);
    setAdded(true);
    onTasksAdded();
    Alert.alert(
      'Added to Calendar!',
      `${newRules.length} recovery task${newRules.length > 1 ? 's' : ''} added to your schedule.`,
      [{ text: 'View Schedule', onPress: onClose }]
    );
  };

  const resetAndClose = () => {
    setQuery('');
    setResult(null);
    setAdded(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View
          style={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: keyboardHeight > 0 ? '58%' : '85%',
            marginBottom:
              Platform.OS === 'android'
                ? (keyboardHeight > 0 ? keyboardHeight : Math.max(insets.bottom, 16) + 12)
                : Math.max(insets.bottom, 16) + 12,
          }}
          className="p-5 pb-6 border-t border-border"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-border">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary/30 items-center justify-center">
                <SparkleIcon size={18} color="#f59e0b" weight="fill" />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-foreground text-base font-bold">
                    Flock AI
                  </Text>
                  <View className="rounded px-1.5 py-0.5 bg-secondary/20">
                    <Text className="text-secondary-foreground text-[10px] font-bold">
                      {result?.source === 'gemini' ? 'Gemini 3.5' : 'Vet Advisor'}
                    </Text>
                  </View>
                </View>
                <Text className="text-muted-foreground text-xs">
                  Poultry care, dosage & routine advisor
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={resetAndClose}
              className="w-8 h-8 rounded-full bg-muted items-center justify-center"
            >
              <XIcon size={16} color={isDark ? '#fafafa' : '#1a1a1a'} weight="bold" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="my-3"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Prompt Chips */}
            {!result && !loading && (
              <View className="mb-4">
                <Text className="text-muted-foreground text-xs font-semibold mb-2 uppercase tracking-wider">
                  Quick Consultations
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTED_CHIPS.map((chip, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setQuery(chip);
                        handleAsk(chip);
                      }}
                      className="rounded-xl border border-border bg-card px-3 py-2 flex-row items-center gap-1.5"
                    >
                      <PillIcon size={14} color="#f59e0b" weight="duotone" />
                      <Text className="text-foreground text-xs font-medium">
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Loading Indicator */}
            {loading && (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text className="text-foreground text-sm font-semibold mt-3">
                  Consulting Poultry Veterinary Model...
                </Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  Analyzing batch counts and scheduling rules
                </Text>
              </View>
            )}

            {/* Result View */}
            {result && !loading && (
              <View className="space-y-4">
                {/* Analysis Box */}
                <View className="rounded-2xl border border-border bg-card p-4">
                  <Text className="text-foreground text-xs font-bold uppercase tracking-wider mb-2 text-primary">
                    Veterinary Assessment
                  </Text>
                  <Text className="text-foreground text-sm leading-relaxed">
                    {result.analysis}
                  </Text>
                </View>

                {/* Dosage Tip if present */}
                {result.dosageTip && (
                  <View className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4 mt-3">
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <PillIcon size={16} color="#d97706" weight="fill" />
                      <Text className="text-secondary-foreground text-xs font-bold uppercase">
                        Dosage & Administration
                      </Text>
                    </View>
                    <Text className="text-foreground text-sm font-medium leading-relaxed">
                      {result.dosageTip}
                    </Text>
                  </View>
                )}

                {/* Suggested Calendar Tasks */}
                {result.suggestedTasks.length > 0 && (
                  <View className="rounded-2xl border border-border bg-card p-4 mt-3">
                    <Text className="text-foreground text-xs font-bold uppercase tracking-wider mb-2">
                      Recommended Care Routine
                    </Text>
                    {result.suggestedTasks.map((t, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center justify-between py-2 border-b border-border/40 last:border-b-0"
                      >
                        <Text className="text-foreground text-sm font-medium flex-1 pr-2">
                          {t.title}
                        </Text>
                        <View className="rounded-full bg-muted px-2 py-0.5">
                          <Text className="text-muted-foreground text-xs font-semibold">
                            {t.daysFromNow === 0
                              ? 'Today'
                              : `+${t.daysFromNow}d (${formatShort(addDays(today, t.daysFromNow))})`}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Add to Calendar Button */}
                    <TouchableOpacity
                      disabled={added}
                      onPress={handleAddToCalendar}
                      className={`mt-4 rounded-xl py-3 px-4 flex-row items-center justify-center gap-2 ${
                        added ? 'bg-muted' : 'bg-secondary'
                      }`}
                    >
                      {added ? (
                        <>
                          <CheckCircleIcon size={18} color="#16a34a" weight="fill" />
                          <Text className="text-muted-foreground text-sm font-bold">
                            Routine Added to Schedule
                          </Text>
                        </>
                      ) : (
                        <>
                          <CalendarPlusIcon size={18} color="#1a1a1a" weight="bold" />
                          <Text className="text-secondary-foreground text-sm font-bold">
                            Add This Routine to Calendar
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Input Box */}
          <View className="flex-row items-center gap-2 pt-2 border-t border-border">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ask about dosage, symptoms, vaccination..."
              placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
              className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-foreground text-sm"
              onSubmitEditing={() => handleAsk()}
              returnKeyType="send"
            />
            <TouchableOpacity
              disabled={loading || !query.trim()}
              onPress={() => handleAsk()}
              className={`rounded-xl px-4 py-2.5 items-center justify-center ${
                query.trim() && !loading ? 'bg-secondary' : 'bg-muted'
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  query.trim() && !loading ? 'text-secondary-foreground' : 'text-muted-foreground'
                }`}
              >
                Ask
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
