import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, createThemedStyles } from '../theme';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export function Page({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (!scroll) return <View style={styles.page}>{children}</View>;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}
export function Heading({ eyebrow, title, subtitle, icon }: { eyebrow?: string; title: string; subtitle?: string; icon?: ReactNode }) {
  const { data } = useApp();
  return <View style={styles.heading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<View style={styles.titleRow}>{icon}<Text style={styles.title}>{t(data?.settings.language, title)}</Text></View>{subtitle ? <Text style={styles.subtitle}>{t(data?.settings.language, subtitle)}</Text> : null}</View>;
}
const styles = createThemedStyles((theme) => ({
  page: { flex: 1, backgroundColor: theme.background }, content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 },
  heading: { backgroundColor: theme.primaryPressed, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16 }, eyebrow: { color: '#C7D7E8', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flex: 1, color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800' }, subtitle: { color: '#E1EBF5', fontSize: 13, lineHeight: 19, marginTop: 5 },
}));
