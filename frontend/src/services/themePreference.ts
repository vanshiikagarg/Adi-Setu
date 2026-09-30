import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../theme';

const THEME_PREFERENCE_KEY = 'adi-setu-theme-mode-v1';

export async function loadThemePreference(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return value === 'Light' || value === 'Dark' || value === 'System' ? value : null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
}
