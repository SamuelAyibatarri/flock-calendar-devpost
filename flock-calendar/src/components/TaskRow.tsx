import { useTheme } from '@/context/ThemeContext';
import type { RuleKind } from '@/storage/store';
import { BroomIcon, BugIcon, CheckIcon, DropIcon, EggIcon, HeartbeatIcon, PlantIcon, PushPinIcon, SyringeIcon } from 'phosphor-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  kind: RuleKind;
  checked: boolean;
  onToggle: () => void;
};

const KindIcon = ({ kind, color }: { kind: RuleKind; color: string}) => {
  switch (kind) {
    case 'checkup': return <HeartbeatIcon size={18} color={"red"} weight="duotone" />;
    case 'feed': return <PlantIcon size={18} color={"green"} weight="duotone" />;
    case 'water': return <DropIcon size={18} color={"blue"} weight="duotone" />;
    case 'eggs': return <EggIcon size={18} color={"brown"} weight="duotone" />;
    case 'cleaning': return <BroomIcon size={18} color={"brown"} weight="duotone" />;
    case 'vaccine': return <SyringeIcon size={18} color={"skyblue"} weight="duotone" />;
    case 'deworm': return <BugIcon size={18} color={"green"} weight="duotone" />;
    case 'custom':
    default: return <PushPinIcon size={18} color={color} weight="duotone" />;
  }
};

export default function TaskRow({ title, kind, checked, onToggle }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const iconColor = checked
    ? (isDark ? '#666666' : '#8a8a80')
    : (isDark ? '#f5f5f5' : '#1a1a1a');

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 rounded-2xl border px-3 py-3 mb-2 ${
        checked ? 'bg-muted border-transparent' : 'bg-card border-border'
      }`}
      activeOpacity={0.7}
      onPress={onToggle}
    >
      <View className="w-9 h-9 rounded-xl items-center justify-center">
        <KindIcon kind={kind} color={iconColor} />
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
          checked ? 'bg-accent border-accent' : 'border border-border bg-card'
        }`}
      >
        {checked && (
          <CheckIcon weight="bold" size={12} color="#ffffff" />
        )}
      </View>
    </TouchableOpacity>
  );
}