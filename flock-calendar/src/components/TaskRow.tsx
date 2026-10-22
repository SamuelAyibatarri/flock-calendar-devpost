import { TouchableOpacity, Text, View } from 'react-native';
import type { RuleKind } from '@/storage/store';

type Props = {
  title: string;
  kind: RuleKind;
  checked: boolean;
  onToggle: () => void;
};

const KIND_ICON: Record<RuleKind, string> = {
  checkup: '🩺',
  feed: '🌾',
  water: '💧',
  eggs: '🥚',
  cleaning: '🧹',
  vaccine: '💉',
  deworm: '🪱',
  custom: '📌',
};

export default function TaskRow({ title, kind, checked, onToggle }: Props) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 rounded-2xl border px-3 py-3 mb-2 ${
        checked ? 'bg-muted border-transparent' : 'bg-card border-border'
      }`}
      activeOpacity={0.7}
      onPress={onToggle}
    >
      <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
        <Text className="text-base">{KIND_ICON[kind]}</Text>
      </View>

      <Text
        className={`flex-1 text-sm ${
          checked
            ? 'text-muted-foreground line-through'
            : 'text-foreground font-medium'
        }`}
      >
        {title}
      </Text>

      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          checked ? 'bg-primary border-primary' : 'border-border bg-card'
        }`}
      >
        {checked && (
          <Text className="text-primary-foreground text-[11px] font-bold">✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
