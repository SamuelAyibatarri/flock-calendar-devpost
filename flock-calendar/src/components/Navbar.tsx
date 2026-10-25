import { usePathname, useRouter, type Href } from 'expo-router';
import { GearIcon, HouseIcon, ListIcon, PlusIcon } from 'phosphor-react-native';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

type TabItem = {
  name: string;
  path: Href;
};

export function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs: TabItem[] = [
    { name: 'index', path: '/' },
    { name: 'history', path: '/history' },
    { name: 'settings', path: '/settings' },
  ];

  const isActive = (path: Href) => {
    const str = typeof path === 'string' ? path : path.pathname;
    return pathname === str || pathname === `/(tabs)${str}`;
  };

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
              onPress={() => router.push(tab.path)}
            />
          ))}
        </View>

        {/* Add task button - circular outline, same row as pill */}
        <Pressable
          accessibilityLabel="Add care task"
          className="rounded-full bg-secondary items-center justify-center border border-secondary"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
          }}
          onPress={() => router.push('/add-task')}
        >
          <PlusIcon size={18} color="#1a1a1a" weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

export default function AppTabs() {
  return null;
}
