import { Tabs } from 'expo-router';
import { House, List, Gear, Plus } from 'phosphor-react-native';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 44;
const PILL_HEIGHT = 56;

type TabButtonProps = {
  route: { name: string; key: string; params?: unknown };
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ route, isFocused, onPress }: TabButtonProps) {
  let Icon: React.ComponentType<React.ComponentProps<typeof House>> = House;
  if (route.name === 'history') Icon = List;
  if (route.name === 'settings') Icon = Gear;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          backgroundColor: isFocused ? '#3a3a3a' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle,
      ]}
    >
      <Icon size={22} color="#ffffff" weight="fill" />
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
        paddingBottom: insets.bottom + 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          pointerEvents: 'box-none',
        }}
      >
        {/* Pill with 3 tabs */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1a1a1a',
            borderRadius: PILL_HEIGHT / 2,
            padding: 4,
          }}
        >
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const onPress = () => {
              navigation.navigate(route.name, route.params);
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

        {/* Add button - circular outline, same row as pill */}
        <Pressable
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: ICON_SIZE / 2,
            borderWidth: 2,
            borderColor: '#e6b800',
            alignItems: 'center',
            justifyContent: 'center',
          } as ViewStyle}
          onPress={() => navigation.navigate('add-task')}
        >
          <Plus size={22} color="#e6b800" weight="fill" />
        </Pressable>
      </View>
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
