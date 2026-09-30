import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, createThemedStyles } from '../../theme';

export function SuggestedQuestion({ question, onPress, disabled = false }: { question: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ask JAGO: ${question}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{question}</Text>
    </Pressable>
  );
}

const styles = createThemedStyles((theme) => ({
  button: { width: '48%', minHeight: 62, justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, paddingHorizontal: 12, paddingVertical: 10 },
  label: { color: theme.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  pressed: { backgroundColor: theme.surfaceStrong, borderColor: theme.primary },
  disabled: { opacity: 0.55 },
}));
