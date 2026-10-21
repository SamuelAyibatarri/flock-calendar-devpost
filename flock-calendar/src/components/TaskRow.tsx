import { TouchableOpacity, Text, View } from 'react-native';

type Props = {
  title: string;
  checked: boolean;
  onToggle: () => void;
};

export default function TaskRow({ title, checked, onToggle }: Props) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between p-3 rounded border mb-1 ${
        checked
          ? 'bg-accent text-accent-foreground border-accent'
          : 'bg-background text-foreground border-border'
      }`}
      onPress={onToggle}
    >
      <View className="flex-1">
        <Text className={`font-medium ${checked ? 'line-through' : ''}`}>
          {title}
        </Text>
      </View>
      <Text className="text-sm font-bold">{checked ? '✓' : '○'}</Text>
    </TouchableOpacity>
  );
}
