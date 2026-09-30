import { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ActionButton } from '../src/components/ActionButton';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { useProfilePhoto } from '../src/context/ProfilePhotoContext';
import { colors, createThemedStyles } from '../src/theme';

export default function ProfilePhotoScreen() {
  const { uri, setUri } = useProfilePhoto();
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function choosePhoto(source: 'gallery' | 'camera') {
    setBusy(true);
    try {
      const permission = source === 'gallery'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', `Allow ${source === 'gallery' ? 'photo library' : 'camera'} access to choose a profile picture.`);
        return;
      }

      const result = source === 'gallery'
        ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 })
        : await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      const selectedUri = result.canceled ? null : result.assets[0]?.uri;
      if (selectedUri) await setUri(selectedUri);
    } catch (error) {
      Alert.alert('Profile picture', error instanceof Error ? error.message : 'Could not select a picture.');
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    try {
      await setUri(null);
    } catch (error) {
      Alert.alert('Profile picture', error instanceof Error ? error.message : 'Could not remove the picture.');
    }
  }

  return <Page>
    <Heading eyebrow="YOUR ACCOUNT" title="Profile picture" subtitle="Choose a photo from your gallery or take a new one with the camera."/>
    <Card style={styles.previewCard}>
      <View style={styles.preview}>
        {uri ? <Image source={{ uri }} style={styles.photo}/> : <Icon name="person-outline" size={58} color={colors.accent}/>}
      </View>
      <Text style={styles.help}>{uri ? 'Your selected profile picture' : 'No profile picture selected'}</Text>
    </Card>
    <ActionButton title="Choose from gallery" icon={<Icon name="image" color={colors.textPrimary}/>} loading={busy} onPress={() => void choosePhoto('gallery')}/>
    <ActionButton title="Take a photo" icon={<Icon name="camera" color={colors.textPrimary}/>} secondary disabled={busy} onPress={() => void choosePhoto('camera')}/>
    {uri ? <ActionButton title="Remove photo" secondary disabled={busy} onPress={() => void removePhoto()}/> : null}
    <ActionButton title="Done" secondary onPress={() => router.back()}/>
  </Page>;
}

const styles = createThemedStyles(theme => ({
  previewCard: { alignItems: 'center', paddingVertical: 22 },
  preview: { width: 164, height: 164, borderRadius: 82, backgroundColor: theme.surfaceStrong, borderWidth: 3, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  help: { marginTop: 12, color: theme.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'center' },
}));
