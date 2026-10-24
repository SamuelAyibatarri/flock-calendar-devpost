import { Tabs, usePathname, useRouter } from 'expo-router';
import { GearIcon, HouseIcon, ListIcon, PlusIcon } from 'phosphor-react-native';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { todayIso } from '@/lib/date';

const ICON_SIZE = 44;

type TabButtonProps = {
  name: string;
  isActive: boolean;
  onPress: () => void;
};

function TabButton({ name, isActive, onPress }: TabButtonProps) {
  let Icon: React.ComponentType<React.ComponentProps<typeof HouseIcon>> = HouseIcon;
  if (name === 'history') Icon = ListIcon;
  if (name === 'settings') Icon = GearIcon;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          backgroundColor: isActive ? '#3a3a3a' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle,
      ]}
    >
      <Icon size={20} color="#ffffff" weight="fill" />
    </Pressable>
  );
}

export function CustomTabBar({ state }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'index', path: '/', label: 'Home' },
    { name: 'history', path: '/history', label: 'History' },
    { name: 'settings', path: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string) => pathname === path || pathname === `/(tabs)${path}`;

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
          gap: 10,
          pointerEvents: 'box-none',
        }}
      >
        {/* Pill with 3 tabs */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1a1a1a',
            borderRadius: ICON_SIZE / 2 + 6,
            padding: 5,
          }}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.name}
              name={tab.name}
              isActive={isActive(tab.path)}
              onPress={() => router.push(tab.path as any)}
            />
          ))}
        </View>

        {/* Add button - circular outline, same row as pill */}
        <Pressable
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: ICON_SIZE / 2,
            borderWidth: 1.5,
            borderColor: '#e6b800',
            backgroundColor: '#e6b800',
            alignItems: 'center',
            justifyContent: 'center',
          } as ViewStyle}
          onPress={() => router.push(`/day/${todayIso()}` as any)}
        >
          <PlusIcon size={18} color="#1a1a1a" weight="bold" />
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
