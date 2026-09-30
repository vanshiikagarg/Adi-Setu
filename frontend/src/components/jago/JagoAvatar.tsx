import { View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon';

export function JagoAvatar({ size = 26 }: { size?: number }) {
  return (
    <View accessibilityLabel="JAGO assistant" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="bot-outline" size={size} color={colors.accent} />
    </View>
  );
}
