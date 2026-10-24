import type { RuleKind } from '@/storage/store';
import { CheckIcon } from 'phosphor-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

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
      <View className="w-9 h-9 rounded-xl items-center justify-center">
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
        className={`w-7 h-7 rounded-full items-center justify-center ${
          checked ? 'bg-accent border-accent' : 'border-border bg-card'
        }`}
      >
        {checked && (
          <CheckIcon weight="bold" size={12} color="#ffffff" />
        )}
      </View>
    </TouchableOpacity>
  );
}
