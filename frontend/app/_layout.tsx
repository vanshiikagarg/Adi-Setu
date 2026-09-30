import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { colors, darkTheme } from '../src/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { NotificationProvider } from '../src/context/NotificationContext';
import { ProfilePhotoProvider } from '../src/context/ProfilePhotoContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function RootStack() {
  const { theme } = useTheme();
  return <><StatusBar style={theme === darkTheme ? 'light' : 'dark'}/><Stack screenOptions={({ navigation, route }) => ({ headerStyle: { backgroundColor: route.name === 'connect' || route.name === 'profile-photo' ? colors.primaryPressed : colors.background }, headerTintColor: route.name === 'connect' || route.name === 'profile-photo' ? '#FFFFFF' : colors.textPrimary, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: colors.background }, headerBackTitle: 'Back', headerBackVisible: false, headerLeft: () => navigation.canGoBack() ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={24} color={route.name === 'connect' || route.name === 'profile-photo' ? '#FFFFFF' : colors.textPrimary}/></Pressable> : null })}>
    <Stack.Screen name="index" options={{ headerShown: false }}/>
    <Stack.Screen name="connect" options={{ headerStyle: { backgroundColor: colors.primaryPressed }, headerTintColor: '#FFFFFF', headerTitle: () => <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Image source={require('../src/images/digilocker.png')} resizeMode="contain" style={{width:30,height:30,tintColor:'#FFFFFF'}}/><Text style={{color:'#FFFFFF',fontSize:16,fontWeight:'700'}}>DigiLocker Consent</Text></View> }}/>
    <Stack.Screen name="profile-photo" options={{ title: 'Profile picture' }}/>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
    <Stack.Screen name="notifications/index" options={{ headerShown: false }}/>
    <Stack.Screen name="scholarship/[id]" options={{ title: 'Scholarship details' }}/>
    <Stack.Screen name="apply/[id]" options={{ title: 'Application' }}/>
    <Stack.Screen name="review" options={{ title: 'Review & confirm' }}/>
    <Stack.Screen name="applications" options={{ title: 'My applications' }}/>
    <Stack.Screen name="payments" options={{ title: 'Payment & DBT' }}/>
    <Stack.Screen name="integrations" options={{ title: 'Verification status' }}/>
    <Stack.Screen name="passport" options={{ title: 'Scholarship Passport' }}/>
    <Stack.Screen name="settings" options={{ title: 'Settings' }}/>
    <Stack.Screen name="help" options={{ title: 'Help Desk' }}/>
    <Stack.Screen name="faqs" options={{ title: 'FAQs' }}/>
    <Stack.Screen name="theme" options={{ title: 'Theme' }}/>
    <Stack.Screen name="language" options={{ title: 'Language' }}/>
    <Stack.Screen name="loading" options={{ title: 'Loading' }}/>
    <Stack.Screen name="error" options={{ title: 'Error' }}/>
    <Stack.Screen name="success" options={{ title: 'Success' }}/>
  </Stack></>;
}

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><ThemeProvider><NotificationProvider><ProfilePhotoProvider><RootStack/></ProfilePhotoProvider></NotificationProvider></ThemeProvider></AppProvider></SafeAreaProvider>;
}
