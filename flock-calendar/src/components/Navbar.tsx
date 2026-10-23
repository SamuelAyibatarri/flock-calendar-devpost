import { Tabs } from 'expo-router';
import { ArrowRight, Gear, List, Plus } from 'phosphor-react-native';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 56;
const PILL_GAP = 12;

type TabButtonProps = {
  route: { name: string; key: string; params?: unknown };
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ route, isFocused, onPress }: TabButtonProps) {
  let Icon: React.ComponentType<React.ComponentProps<typeof ArrowRight>> = ArrowRight;
  if (route.name === 'history') Icon = List;
  if (route.name === 'settings') Icon = Gear;

  const iconColor = isFocused ? '#ffffff' : '#6b7a6e';
  const bgColor = isFocused ? '#4a9a5c' : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: '#4a9a5c',
          borderWidth: isFocused ? 0 : 1,
        } as ViewStyle,
      ]}
    >
      <Icon size={24} color={iconColor} weight={isFocused ? 'fill' : 'regular'} />
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'box-none',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: PILL_GAP,
          pointerEvents: 'box-none',
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <TabButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>

      <Pressable
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          backgroundColor: '#e6b800',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: PILL_GAP,
          marginBottom: insets.bottom + 12,
        } as ViewStyle}
        onPress={() => navigation.navigate('add-task')}
      >
        <Plus size={24} color="#1f5f42" weight="fill" />
      </Pressable>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
