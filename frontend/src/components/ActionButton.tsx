import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, createThemedStyles } from '../theme';

export function ActionButton({ title, onPress, secondary = false, disabled = false, loading = false, icon }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean; icon?: ReactNode }) {
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || loading) && styles.disabled, pressed && !secondary && styles.pressed, pressed && secondary && styles.secondaryPressed]}>
    {loading ? <ActivityIndicator color={disabled || loading ? colors.disabledText : secondary ? colors.primary : colors.textPrimary} /> : <View style={styles.content}>{icon}{<Text style={[styles.label, secondary && styles.secondaryLabel, disabled && styles.disabledLabel]}>{title}</Text>}</View>}
  </Pressable>;
}
const styles = createThemedStyles((theme) => ({ button: { minHeight: 48, borderRadius: radius.button, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 10 }, secondary: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.secondary }, disabled: { backgroundColor: theme.disabled }, pressed: { backgroundColor: theme.primaryPressed }, secondaryPressed: { backgroundColor: theme.surfaceStrong }, content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, label: { color: theme.textPrimary, fontSize: 13, fontWeight: '700' }, secondaryLabel: { color: theme.textSecondary }, disabledLabel: { color: theme.disabledText } }));
