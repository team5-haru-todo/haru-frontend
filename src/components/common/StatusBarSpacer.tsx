import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/src/constants/layout';

export function StatusBarSpacer() {
  const insets = useSafeAreaInsets();
  const height = Math.max(layout.statusBarHeight, insets.top);

  return <View style={{ height, width: '100%' }} />;
}
