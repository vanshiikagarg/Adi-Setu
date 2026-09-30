import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, createThemedStyles } from '../theme';
import { ActionButton } from './ActionButton';
import { useApp } from '../context/AppContext';

export function LoadState({ children }: { children: React.ReactNode }) {
  const { loading, error, reload } = useApp();
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large"/><Text style={styles.text}>Loading Adi Setu…</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.title}>Can’t load Adi Setu</Text><Text style={styles.text}>{error}</Text><ActionButton title="Try again" onPress={() => void reload()}/></View>;
  return <>{children}</>;
}
const styles = createThemedStyles((theme) => ({ center: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 }, title: { color: theme.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' }, text: { color: theme.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20 } }));
