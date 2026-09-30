import { useSyncExternalStore } from 'react';
import { StyleSheet } from 'react-native';

export type ThemeMode = 'Light' | 'Dark' | 'System';
export type ThemeColors = {
  background: string; surface: string; surfaceStrong: string; primary: string; primaryPressed: string;
  secondary: string; accent: string; textPrimary: string; textSecondary: string; textMuted: string;
  border: string; input: string; disabled: string; disabledText: string; error: string; warning: string;
  warningSurface: string; errorSurface: string; overlay: string; verified: string; verifiedBackground: string;
};

// The light palette preserves ADI SETU's existing white-surface / blue-action design.
export const lightTheme: ThemeColors = {
  background: '#F4F8FC', surface: '#FFFFFF', surfaceStrong: '#EAF2FB', primary: '#1769AA',
  primaryPressed: '#10568F', secondary: '#245B8D', accent: '#1769AA', textPrimary: '#142D46',
  textSecondary: '#344E68', textMuted: '#667F97', border: '#D5E1EC', input: '#FFFFFF',
  disabled: '#E5EBF1', disabledText: '#8191A2', error: '#C83D4B', warning: '#A56700',
  warningSurface: '#FFF4DC', errorSurface: '#FFF0F1', overlay: 'rgba(0, 0, 0, 0.45)',
  verified: '#1769AA', verifiedBackground: '#E5F1FC',
};

export const darkTheme: ThemeColors = {
  background: '#071D3B', surface: '#0B2D5C', surfaceStrong: '#123F78', primary: '#2F80ED',
  primaryPressed: '#4793FA', secondary: '#1D5FA7', accent: '#5EA7F7', textPrimary: '#FFFFFF',
  textSecondary: '#DCEBFA', textMuted: '#AFC4DA', border: '#244B76', input: '#0A264A',
  disabled: '#183858', disabledText: '#7189A3', error: '#FF6B6B', warning: '#F2B84B',
  warningSurface: '#123F78', errorSurface: '#123F78', overlay: 'rgba(0, 0, 0, 0.55)',
  verified: '#5EA7F7', verifiedBackground: '#123F78',
};
export const radius = { card: 14, button: 12 };

let activeTheme: ThemeColors = lightTheme;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function snapshot() { return activeTheme; }
export function useThemeRevision() { return useSyncExternalStore(subscribe, snapshot, snapshot); }
export function setActiveTheme(theme: ThemeColors) {
  if (activeTheme === theme) return;
  activeTheme = theme;
  listeners.forEach(listener => listener());
}
export function getActiveTheme() { return activeTheme; }

// Existing components can keep using `colors`; values resolve from the active palette.
export const colors = new Proxy({} as ThemeColors, {
  get: (_target, property: keyof ThemeColors) => activeTheme[property],
});

// Stylesheets are cached for both palettes and selected dynamically at render time.
export function createThemedStyles(factory: (theme: ThemeColors) => StyleSheet.NamedStyles<any>): any {
  const cache = new WeakMap<ThemeColors, StyleSheet.NamedStyles<any>>();
  return new Proxy({} as StyleSheet.NamedStyles<any>, {
    get: (_target, property: string | symbol) => {
      let styles = cache.get(activeTheme);
      if (!styles) {
        const created = StyleSheet.create(factory(activeTheme));
        cache.set(activeTheme, created);
        styles = created;
      }
      return Reflect.get(styles, property);
    },
  });
}
