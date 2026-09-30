import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../src/components/ActionButton';
import { Icon } from '../src/components/Icon';
import { colors, createThemedStyles, useThemeRevision } from '../src/theme';

export default function SuccessScreen() {
  useThemeRevision();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isApplication = type === 'application';
  const isPrototype = type === 'prototype-connect';
  return (
    <View style={styles.center}>
      <View style={styles.check} accessible accessibilityLabel="Successful completion">
        <Icon name="badge-check" size={38} color={colors.verified} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{isApplication ? 'Application saved' : isPrototype ? 'Prototype consent complete' : 'Success'}</Text>
      <Text style={styles.copy}>{isApplication ? 'Your sample application is saved on this device. It was not sent to a scholarship portal.' : isPrototype ? 'Sample document choices are ready to preview. No DigiLocker account or certificate was verified.' : 'You can continue browsing the prototype.'}</Text>
      <ActionButton title="Continue" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}

const styles = createThemedStyles((theme) => ({
  center: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  check: { width: 76, height: 76, borderRadius: 42, backgroundColor: theme.verifiedBackground, borderWidth: 1, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 23, fontWeight: '800', color: theme.textPrimary, marginTop: 15 },
  copy: { fontSize: 12, color: theme.textSecondary, lineHeight: 18, textAlign: 'center', marginVertical: 8 },
}));
