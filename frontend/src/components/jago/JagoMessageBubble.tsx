import { StyleSheet, Text, View } from 'react-native';
import { colors, createThemedStyles } from '../../theme';
import { JagoAvatar } from './JagoAvatar';

export function JagoMessageBubble({ from, text }: { from: 'jago' | 'you'; text: string }) {
  const isJago = from === 'jago';
  return (
    <View style={[styles.row, !isJago && styles.userRow]}>
      {isJago ? <JagoAvatar size={24} /> : null}
      <View style={[styles.bubble, isJago ? styles.assistantBubble : styles.userBubble]}>
        <Text style={[styles.sender, !isJago && styles.userSender]}>{isJago ? 'JAGO' : 'YOU'}</Text>
        <Text selectable style={[styles.message, !isJago && styles.userMessage]}>{text}</Text>
      </View>
    </View>
  );
}

export function JagoTypingIndicator() {
  return (
    <View style={styles.row}>
      <JagoAvatar size={24} />
      <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
        <Text style={styles.sender}>JAGO</Text>
        <Text accessibilityLiveRegion="polite" style={styles.typing}>JAGO is typing...</Text>
      </View>
    </View>
  );
}

const styles = createThemedStyles((theme) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, alignSelf: 'flex-start', maxWidth: '96%' },
  userRow: { alignSelf: 'flex-end' },
  bubble: { maxWidth: '100%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 10 },
  assistantBubble: { backgroundColor: theme.surfaceStrong, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 5 },
  sender: { color: theme.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginBottom: 3 },
  userSender: { color: theme.textPrimary, textAlign: 'right' },
  message: { color: theme.textPrimary, fontSize: 14, lineHeight: 20 },
  userMessage: { color: theme.textPrimary },
  typingBubble: { minWidth: 154 },
  typing: { color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' },
}));
