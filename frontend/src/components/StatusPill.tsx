import { StyleSheet, Text, View } from 'react-native';
import { colors, createThemedStyles } from '../theme';
import { Icon, AppIconName } from './Icon';

type StatusTone = 'verified' | 'pending' | 'error' | 'info';

export function StatusPill({ label, tone = 'info' }: { label: string; tone?: StatusTone }) {
  const tones = {
    verified: [colors.verifiedBackground, colors.verified, 'badge-check'],
    pending: [colors.warningSurface, colors.warning, 'clock-3'],
    error: [colors.errorSurface, colors.error, 'circle-alert'],
    info: [colors.surfaceStrong, colors.accent, 'info'],
  } as const;
  const [backgroundColor, color, icon] = tones[tone];
  return <View style={[styles.pill, { backgroundColor }]}><Icon name={icon as AppIconName} size={16} color={color}/><Text style={[styles.text, { color }]}>{label}</Text></View>;
}

const styles = createThemedStyles((theme) => ({ pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 30, paddingHorizontal: 9, paddingVertical: 5 }, text: { fontSize: 10, fontWeight: '700' } }));
