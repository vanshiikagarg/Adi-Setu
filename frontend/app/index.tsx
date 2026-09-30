import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { useApp } from '../src/context/AppContext';
import { colors, createThemedStyles } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { data, loading } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Image
          source={require('../src/images/MinistryLogo.png')}
          resizeMode="contain"
          style={styles.logo}
        />

        <Text style={styles.gov}>Ministry Of Tribal Affairs</Text>

        <Text style={styles.govSecondary}>
          Government of India
        </Text>

        <View style={styles.brandCircle}><Text style={styles.brand}>ADI SETU</Text></View>

        <Text style={styles.subtitle}>
          Student Scholarship &{'\n'}Document Passport
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.copy}>
          Verify once. Reuse trusted documents.{'\n'}
          Apply with confidence.
        </Text>

        <View style={styles.buttons}>
          <ActionButton
            title="Continue with DigiLocker"
            icon={
              <Image
                source={require('../src/images/digilocker.png')}
                resizeMode="contain"
                style={styles.digilockerIcon}
              />
            }
            loading={loading}
            onPress={() =>
              router.push(
                data?.profile.connected ? '/(tabs)' : '/connect'
              )
            }
          />

          <ActionButton
            title="Learn about ADI SETU"
            secondary
            onPress={() => router.push('/help')}
          />
        </View>

        <Text style={styles.foot}>
          Empowering Tribal Students.{'\n'}
          Building a Brighter Future.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles((theme) => ({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 18,
    justifyContent: 'flex-start',
  },

  top: {
    alignItems: 'center',
    paddingTop: 20,
  },

  // Black Ministry logo
  logo: {
    width: 120,
    height: 120,
  },

  gov: {
    color: theme.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20, // reduced from 18
    fontWeight: '700',
  },

  govSecondary: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },

  brandCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.primaryPressed,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 30,
    color: theme.textSecondary,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'center',
  },

  bottom: {
    marginTop: 45,
    
    paddingBottom: 40,
  },

  copy: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 14,
  },

  buttons: {
    width: '100%',
    gap: 10,
  },

  digilockerIcon: {
    width: 45,
    height: 45,
  },

  foot: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 20, // reduced from 15
  },
}));
