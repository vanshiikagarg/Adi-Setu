import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, createThemedStyles } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = createThemedStyles((theme) => ({ card: { padding: 15, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: radius.card, marginBottom: 12 } }));
