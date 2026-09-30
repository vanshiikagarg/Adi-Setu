import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'adi-setu-profile-photo-v1';
type ProfilePhotoContextValue = { uri: string | null; setUri: (uri: string | null) => Promise<void> };
const ProfilePhotoContext = createContext<ProfilePhotoContextValue | null>(null);

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [uri, setUriState] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (mounted) setUriState(value);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const setUri = useCallback(async (nextUri: string | null) => {
    setUriState(nextUri);
    if (nextUri) await AsyncStorage.setItem(STORAGE_KEY, nextUri);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return <ProfilePhotoContext.Provider value={{ uri, setUri }}>{children}</ProfilePhotoContext.Provider>;
}

export function useProfilePhoto() {
  const value = useContext(ProfilePhotoContext);
  if (!value) throw new Error('useProfilePhoto must be used inside ProfilePhotoProvider');
  return value;
}
