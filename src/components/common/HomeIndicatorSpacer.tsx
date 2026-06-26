import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HomeIndicatorSpacer() {
  const insets = useSafeAreaInsets();
  const height = Math.max(50, insets.bottom);
  return <View style={{ height }} />;
}