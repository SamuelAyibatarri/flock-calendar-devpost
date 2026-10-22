import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  suffix?: string;
  children?: ReactNode;
} & Pick<TextInputProps, 'keyboardType' | 'placeholder' | 'maxLength'>;

export default function Field({
  label,
  value,
  onChangeText,
  hint,
  suffix,
  children,
  ...inputProps
}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-foreground text-sm font-medium mb-1.5">{label}</Text>
      {children ?? (
        <View className="flex-row items-center rounded-xl border border-border bg-background px-3">
          <TextInput
            className="flex-1 py-3 text-base text-foreground"
            placeholderTextColor="#8a8a80"
            value={value}
            onChangeText={onChangeText}
            {...inputProps}
          />
          {suffix ? (
            <Text className="text-muted-foreground text-xs font-medium ml-2">
              {suffix}
            </Text>
          ) : null}
        </View>
      )}
      {hint ? (
        <Text className="text-muted-foreground text-xs mt-1.5">{hint}</Text>
      ) : null}
    </View>
  );
}
