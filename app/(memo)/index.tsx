import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/src/constants';

export default function MemoListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <View style={styles.navBarRow}>
          <Text style={styles.navBarTitle}>메모장</Text>
          <Pressable style={styles.closeButton} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            아직 적어둔 할 일이 없어요{'\n'}편하게 적어두고 나중에 꺼내 보세요 🌱
          </Text>
        </View>
      </View>

      <View style={[styles.addButtonWrapper, { paddingBottom: insets.bottom }]}>
        <Pressable style={styles.addButton} onPress={() => {}}>
          <Ionicons name="add-circle" size={24} color={colors.primary.default} />
          <Text style={styles.addButtonLabel}>할 일 추가</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.sunken,
  },
  navBar: {
    backgroundColor: colors.surface.default,
  },
  navBarRow: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
  },
  navBarTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  emptyText: {
    ...typography.b3BodyRegular,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  addButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface.sunken,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonLabel: {
    ...typography.b3BodyRegular,
    color: colors.text.secondary,
  },
});
