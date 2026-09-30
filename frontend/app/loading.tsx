import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, createThemedStyles, useThemeRevision } from '../src/theme';

export default function LoadingScreen(){useThemeRevision();return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/><Text style={styles.text}>Fetching your information…</Text></View>}
const styles=createThemedStyles((theme) => ({center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:theme.background},text:{fontSize:12,color:theme.textMuted,marginTop:15}}));
