import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppData } from '../types';
import { useThemeRevision } from '../theme';

type AppContextValue = { data: AppData | null; loading: boolean; error: string | null; reload: () => Promise<void>; updateProfile: (patch: Partial<AppData['profile']>) => Promise<void>; saveDraft: (scholarshipId: string, draft: Record<string, unknown>) => Promise<void>; saveSettings: (patch: Partial<AppData['settings']>) => Promise<void> };
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await api.get<AppData>('/bootstrap')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the prototype'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  const updateProfile = async (patch: Partial<AppData['profile']>) => {
    const profile = await api.patch<AppData['profile']>('/profile', patch);
    setData(current => current ? { ...current, profile } : current);
  };
  const saveDraft = async (scholarshipId: string, draft: Record<string, unknown>) => {
    const response = await api.post<{ draft: Record<string, unknown> }>('/application-draft', { scholarshipId, ...draft });
    setData(current => current ? { ...current, drafts: { ...(current.drafts || {}), [scholarshipId]: response.draft } } : current);
  };
  const saveSettings = async (patch: Partial<AppData['settings']>) => {
    const settings = await api.patch<AppData['settings']>('/settings', patch);
    setData(current => current ? { ...current, settings } : current);
  };
  return <AppContext.Provider value={{ data, loading, error, reload, updateProfile, saveDraft, saveSettings }}>{children}</AppContext.Provider>;
}
export function useApp() {
  useThemeRevision();
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
