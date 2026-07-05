import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { TaskResponse } from '@/src/api/task';
import { useMemos } from '@/src/hooks/useMemos';
import { colors, radius, spacing, typography } from '@/src/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (memo: TaskResponse) => void;
};

function formatRelativeDays(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return '';
  const days = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

export default function MemoPreviewSheet({ visible, onClose, onSelect }: Props) {
  const router = useRouter();
  const { memos, loading, refreshMemos } = useMemos();
  const insets = useSafeAreaInsets();
  // iOS는 기존 여백(spacing.lg) 그대로 유지. Android는 시스템 네비게이션 바 높이(insets.bottom)를
  // 반영해, 고정 여백보다 실제 시스템 바가 큰 기기에서 버튼이 가려지지 않게 한다.
  const openButtonMarginBottom =
    Platform.OS === 'android' ? Math.max(insets.bottom, spacing.lg) : spacing.lg;

  useEffect(() => {
    if (visible) {
      refreshMemos();
    }
  }, [visible, refreshMemos]);

  const pinnedMemos = memos.filter((m) => m.taskType === 'RECURRING').slice(0, 2);
  const unpinnedMemos = memos.filter((m) => m.taskType !== 'RECURRING').slice(0, 2);
  const hasMemos = memos.length > 0;

  const handleOpenMemo = () => {
    onClose();
    router.push('/(memo)');
  };

  const handleChallenge = (memo: TaskResponse) => {
    onSelect(memo);
  };

  const renderCard = (memo: TaskResponse) => (
    <Pressable key={memo.id} style={styles.memoCard} onPress={() => handleChallenge(memo)}>
      <View style={styles.memoCardContent}>
        <Text style={styles.memoCardTitle}>{memo.content}</Text>
        <Text style={styles.memoCardTime}>{formatRelativeDays(memo.createdAt)}</Text>
      </View>
      <View style={styles.challengeButton}>
        <Text style={styles.challengeButtonLabel}>도전</Text>
      </View>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <Pressable style={styles.chevronWrapper} onPress={onClose} hitSlop={12}>
          <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
        </Pressable>

        <Text style={styles.headerTitle}>메모장</Text>

        {!hasMemos && !loading ? (
          <View style={styles.contentBg}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                아직 적어둔 할 일이 없어요{'\n'}편하게 적어두고 나중에 꺼내 보세요 🌱
              </Text>
            </View>
            <Pressable
              style={[styles.openButton, { marginBottom: openButtonMarginBottom }]}
              onPress={handleOpenMemo}
            >
              <Text style={styles.openButtonLabel}>메모장에 적어보기</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contentBg}>
            <View style={styles.listViewport}>
              {pinnedMemos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>즐겨찾기</Text>
                  {pinnedMemos.map(renderCard)}
                </View>
              )}
              {unpinnedMemos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>전체</Text>
                  {unpinnedMemos.map(renderCard)}
                </View>
              )}
            </View>
            <Pressable
              style={[styles.openButton, { marginBottom: openButtonMarginBottom }]}
              onPress={handleOpenMemo}
            >
              <Text style={styles.openButtonLabel}>메모장 열기</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21,23,28,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chevronWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    textAlign: 'center',
    paddingBottom: 16,
  },
  contentBg: {
    flex: 1,
    backgroundColor: colors.surface.sunken,
  },
  listViewport: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
  },
  memoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  memoCardContent: {
    flex: 1,
    gap: 2,
    padding: 10,
  },
  memoCardTitle: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
  memoCardTime: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
  },
  challengeButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  challengeButtonLabel: {
    ...typography.b4BodySm,
    color: colors.primary.default,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  emptyText: {
    ...typography.b3BodyRegular,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  openButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    // marginBottom은 Android navigation bar 대응을 위해 JSX에서 동적으로 부여한다(위 참고).
    borderRadius: radius.pill,
    backgroundColor: colors.primary.default,
  },
  openButtonLabel: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});
