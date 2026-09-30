import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { colors, createThemedStyles, useThemeRevision } from '../src/theme';

const items = [
  ['FAQs', 'Common questions', '/faqs', 'help-circle-outline'],
  ['Contact support', 'Get help with the app', '/faqs', 'chatbubbles-outline'],
  ['User guide', 'How to use ADI SETU', '/faqs', 'document-text-outline'],
] as const;

export default function HelpScreen() {
  useThemeRevision();
  const router = useRouter();
  return (
    <Page>
      <Heading eyebrow="SUPPORT" title="Help Desk" subtitle="Find answers about the prototype screens." />
      <Card>
        {items.map(([title, description, path, icon]) => (
          <Pressable key={title} onPress={() => router.push(path)} style={styles.item}>
            <Icon name={icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <Icon name="chevron-forward" color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
      <Card style={{ backgroundColor: colors.surfaceStrong }}>
        <Text style={styles.title}>Prototype mode</Text>
        <Text style={styles.description}>DigiLocker consent and document choices are sample screens. No account is connected and no certificate is verified.</Text>
      </Card>
    </Page>
  );
}

const styles = createThemedStyles((theme) => ({
  item: { minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: theme.border },
  title: { fontSize: 12, fontWeight: '700', color: theme.textPrimary },
  description: { fontSize: 10, color: theme.textMuted, marginTop: 4 },
}));
