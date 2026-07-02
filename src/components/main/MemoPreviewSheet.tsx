import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { setTodayTask } from '@/src/api/record';
import type { TaskResponse } from '@/src/api/task';
import { useMemos } from '@/src/hooks/useMemos';
import { colors, radius, spacing, typography } from '@/src/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function formatRelativeDays(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return '';
  const days = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

export default function MemoPreviewSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const { memos, loading, refreshMemos } = useMemos();

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

  const handleChallenge = async (memo: TaskResponse) => {
    try {
      await setTodayTask(memo.id);
      onClose();
    } catch (e) {
      console.error('오늘의 한 개 설정 실패:', e);
    }
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
            <Pressable style={styles.openButton} onPress={handleOpenMemo}>
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
            <Pressable style={styles.openButton} onPress={handleOpenMemo}>
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
    marginVertical: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.default,
  },
  openButtonLabel: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});
