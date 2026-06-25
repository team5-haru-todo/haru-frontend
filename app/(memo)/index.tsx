import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScrollView, Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/src/constants';

const pinIcon = require('@/assets/images/memo/pin-icon.png');
const pinFilledIcon = require('@/assets/images/memo/pin-filled-icon.png');
const trashIcon = require('@/assets/images/memo/trash-icon.png');

const TOAST_VISIBLE_MS = 3000;
const TOAST_FADE_MS = 400;

type Memo = {
  id: string;
  title: string;
  createdAt: number;
  pinned: boolean;
};

function formatRelativeDays(createdAt: number) {
  const days = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

export default function MemoListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAdding, setIsAdding] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleChallenge = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastVisible(true);
    toastOpacity.setValue(1);
    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: TOAST_FADE_MS,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, TOAST_VISIBLE_MS);
  };

  const handleSubmitMemo = () => {
    const title = memoText.trim();
    if (title.length > 0) {
      setMemos((prev) => [
        { id: Date.now().toString(), title, createdAt: Date.now(), pinned: false },
        ...prev,
      ]);
    }
    setMemoText('');
    setIsAdding(false);
  };

  const handleTogglePin = (id: string) => {
    setMemos((prev) => prev.map((memo) => (memo.id === id ? { ...memo, pinned: !memo.pinned } : memo)));
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId !== null) {
      setMemos((prev) => prev.filter((memo) => memo.id !== pendingDeleteId));
    }
    setPendingDeleteId(null);
  };

  const pinnedMemos = memos.filter((memo) => memo.pinned);
  const unpinnedMemos = memos.filter((memo) => !memo.pinned);

  const renderInput = () => (
    <TextInput
      style={styles.input}
      value={memoText}
      onChangeText={setMemoText}
      onSubmitEditing={handleSubmitMemo}
      returnKeyType="done"
      placeholder="할 일을 적어보세요"
      placeholderTextColor={colors.text.placeholder}
      cursorColor={colors.primary.default}
      autoFocus
    />
  );

  const renderMemoRow = (memo: Memo) => (
    <Swipeable
      key={memo.id}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <Pressable style={styles.pinButton} onPress={() => handleTogglePin(memo.id)}>
            <Image
              source={memo.pinned ? pinFilledIcon : pinIcon}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => setPendingDeleteId(memo.id)}>
            <Image source={trashIcon} style={styles.actionIcon} contentFit="contain" />
          </Pressable>
        </View>
      )}>
      <View style={styles.memoCard}>
        <View style={styles.memoCardContent}>
          <Text style={styles.memoCardTitle}>{memo.title}</Text>
          <Text style={styles.memoCardTime}>{formatRelativeDays(memo.createdAt)}</Text>
        </View>
        <Pressable style={styles.challengeButton} onPress={handleChallenge}>
          <Text style={styles.challengeButtonLabel}>도전</Text>
        </Pressable>
      </View>
    </Swipeable>
  );

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
        {isAdding && memos.length === 0 ? (
          <View style={styles.listWrapper}>{renderInput()}</View>
        ) : memos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              아직 적어둔 할 일이 없어요{'\n'}편하게 적어두고 나중에 꺼내 보세요 🌱
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>즐겨찾기</Text>
              {pinnedMemos.map(renderMemoRow)}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>전체</Text>
              {isAdding && renderInput()}
              {unpinnedMemos.map(renderMemoRow)}
            </View>
          </ScrollView>
        )}
      </View>

      {!(isAdding && memos.length === 0) && (
        <View style={[styles.addButtonWrapper, { paddingBottom: insets.bottom }]}>
          <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Ionicons name="add-circle" size={24} color={colors.primary.default} />
            <Text style={styles.addButtonLabel}>할 일 추가</Text>
          </Pressable>
        </View>
      )}

      {toastVisible && (
        <Animated.View
          style={[styles.toastWrapper, { bottom: insets.bottom + 106, opacity: toastOpacity }]}
          pointerEvents="none">
          <LinearGradient
            colors={['#52565F', '#8A8E99']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.toast}>
            <View style={styles.toastCheckIcon}>
              <Ionicons name="checkmark" size={14} color={colors.surface.default} />
            </View>
            <Text style={styles.toastLabel}>오늘의 한개로 설정했어요</Text>
          </LinearGradient>
        </Animated.View>
      )}

      <Modal
        visible={pendingDeleteId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingDeleteId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Image source={trashIcon} style={styles.actionIcon} contentFit="contain" />
            <View style={styles.modalTextGroup}>
              <Text style={styles.modalTitle}>이 메모를 삭제할까요?</Text>
              <Text style={styles.modalSubtitle}>삭제하면 다시 되돌릴 수 없어요</Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={() => setPendingDeleteId(null)}>
                <Text style={styles.modalCancelLabel}>취소</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmButton} onPress={handleConfirmDelete}>
                <Text style={styles.modalConfirmLabel}>삭제하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 10,
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
  listWrapper: {
    width: '100%',
    padding: 10,
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
  },
  section: {
    width: '100%',
    padding: 10,
    gap: 8,
  },
  sectionLabel: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary.default,
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.b3BodyRegular,
    color: colors.text.primary,
  },
  memoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  pinButton: {
    width: 74,
    height: 74,
    borderRadius: radius.button,
    backgroundColor: '#E8E9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 74,
    height: 74,
    borderRadius: radius.button,
    backgroundColor: '#FFDFDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
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
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toastCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastLabel: {
    ...typography.b4BodySm,
    color: colors.surface.default,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: 291,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    borderRadius: radius.card,
    backgroundColor: colors.surface.default,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTextGroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  modalTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.b4BodySm,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  modalCancelLabel: {
    ...typography.b2BodyBold,
    color: colors.text.tertiary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary.default,
  },
  modalConfirmLabel: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});
