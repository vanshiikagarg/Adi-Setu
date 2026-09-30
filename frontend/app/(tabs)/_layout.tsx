import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Icon, AppIconName } from '../../src/components/Icon';
import { colors } from '../../src/theme';
import { useApp } from '../../src/context/AppContext';
import { t } from '../../src/i18n';

const icons: Record<string, AppIconName> = {
  index: 'home-outline',
  scholarships: 'graduation-cap',
  documents: 'document-text-outline',
  assistant: 'bot-outline',
  profile: 'person-outline',
};
const labels: Record<string, string> = { index: 'Home', scholarships: 'Scholarships', documents: 'Documents', assistant: 'JAGO', profile: 'Profile' };

export default function TabLayout() {
  const { data } = useApp();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: colors.primaryPressed },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '700', color: '#FFFFFF' },
      tabBarActiveTintColor: '#FFFFFF',
      tabBarInactiveTintColor: '#C7D7E8',
      tabBarStyle: { height: 61, paddingTop: 5, paddingBottom: 5, borderTopColor: colors.primaryPressed, backgroundColor: colors.primaryPressed },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarLabel: ({ focused, children }) => <Text style={{ color: focused ? '#FFFFFF' : '#C7D7E8', fontSize: 10, fontWeight: '600' }}>{children}</Text>,
      tabBarIcon: ({ focused }) => <Icon name={icons[route.name]} size={24} color={focused ? '#FFFFFF' : '#C7D7E8'} />,
    })}>
      <Tabs.Screen name="index" options={{ title: t(data?.settings.language, labels.index) }} />
      <Tabs.Screen name="scholarships" options={{ title: t(data?.settings.language, labels.scholarships) }} />
      <Tabs.Screen name="documents" options={{ title: t(data?.settings.language, labels.documents) }} />
      <Tabs.Screen name="assistant" options={{ title: labels.assistant }} />
      <Tabs.Screen name="profile" options={{ title: t(data?.settings.language, labels.profile) }} />
    </Tabs>
  );
}
