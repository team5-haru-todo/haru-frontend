import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import ReorderableList, { useReorderableDrag } from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TaskResponse } from '@/src/api/task';
import { useMemos } from '@/src/hooks/useMemos';
import { colors, radius, spacing, typography } from '@/src/constants';

const pinIcon = require('@/assets/images/memo/pin-icon.png');
const pinFilledIcon = require('@/assets/images/memo/pin-filled-icon.png');
const trashIcon = require('@/assets/images/memo/trash-icon.png');

const TOAST_VISIBLE_MS = 3000;
const TOAST_FADE_MS = 400;

function formatRelativeDays(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return '';
  }
  const days = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

type MemoRowProps = {
  memo: TaskResponse;
  isEditing: boolean;
  editText: string;
  onChangeEdit: (text: string) => void;
  onSubmitEdit: () => void;
  onStartEdit: (memo: TaskResponse) => void;
  onTogglePin: (memo: TaskResponse) => void;
  onRequestDelete: (id: number) => void;
  onChallenge: () => void;
  onLongPress?: () => void;
};

function MemoRow({
  memo,
  isEditing,
  editText,
  onChangeEdit,
  onSubmitEdit,
  onStartEdit,
  onTogglePin,
  onRequestDelete,
  onChallenge,
  onLongPress,
}: MemoRowProps) {
  if (isEditing) {
    return (
      <TextInput
        style={styles.input}
        value={editText}
        onChangeText={onChangeEdit}
        onSubmitEditing={onSubmitEdit}
        onBlur={onSubmitEdit}
        returnKeyType="done"
        cursorColor={colors.primary.default}
        autoFocus
      />
    );
  }
  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <Pressable style={styles.pinButton} onPress={() => onTogglePin(memo)}>
            <Image
              source={memo.taskType === 'RECURRING' ? pinFilledIcon : pinIcon}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => onRequestDelete(memo.id)}>
            <Image source={trashIcon} style={styles.actionIcon} contentFit="contain" />
          </Pressable>
        </View>
      )}>
      <Pressable style={styles.memoCard} onPress={() => onStartEdit(memo)} onLongPress={onLongPress}>
        <View style={styles.memoCardContent}>
          <Text style={styles.memoCardTitle}>{memo.content}</Text>
          <Text style={styles.memoCardTime}>{formatRelativeDays(memo.createdAt)}</Text>
        </View>
        <Pressable style={styles.challengeButton} onPress={onChallenge}>
          <Text style={styles.challengeButtonLabel}>도전</Text>
        </Pressable>
      </Pressable>
    </Swipeable>
  );
}

function DraggableMemoRow(props: MemoRowProps) {
  const drag = useReorderableDrag();
  return <MemoRow {...props} onLongPress={drag} />;
}

export default function MemoListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memos, loading, error, addMemo, editMemo, removeMemo, toggleMemoRecurring, reorderMemos } =
    useMemos();
  const [isAdding, setIsAdding] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editSubmittingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleReorder = ({ from, to }: { from: number; to: number }) => {
    reorderMemos(from, to);
  };

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

  const handleSubmitMemo = async () => {
    const content = memoText.trim();
    if (content.length === 0) {
      setMemoText('');
      setIsAdding(false);
      return;
    }

    const success = await addMemo(content);
    if (success) {
      setMemoText('');
      setIsAdding(false);
    }
  };

  const handleTogglePin = async (memo: TaskResponse) => {
    await toggleMemoRecurring(memo);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId !== null) {
      const success = await removeMemo(pendingDeleteId);
      if (!success) {
        return;
      }
    }
    setPendingDeleteId(null);
  };

  const startEditing = (memo: TaskResponse) => {
    setEditingId(memo.id);
    setEditText(memo.content);
  };

  const handleSubmitEdit = async () => {
    if (editSubmittingRef.current) {
      return;
    }

    const content = editText.trim();
    if (content.length === 0 || editingId === null) {
      setEditingId(null);
      setEditText('');
      return;
    }

    editSubmittingRef.current = true;
    const taskId = editingId;
    const success = await editMemo(taskId, content);
    if (success) {
      setEditingId(null);
      setEditText('');
    }
    editSubmittingRef.current = false;
  };

  const pinnedMemos = memos.filter((memo) => memo.taskType === 'RECURRING');
  const unpinnedMemos = memos.filter((memo) => memo.taskType !== 'RECURRING');

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

  const memoRowHandlers = {
    editText,
    onChangeEdit: setEditText,
    onSubmitEdit: handleSubmitEdit,
    onStartEdit: startEditing,
    onTogglePin: handleTogglePin,
    onRequestDelete: setPendingDeleteId,
    onChallenge: handleChallenge,
  };

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
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary.default} />
          </View>
        ) : isAdding && memos.length === 0 ? (
          <View style={styles.listWrapper}>{renderInput()}</View>
        ) : memos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {error
                ? '메모를 불러오지 못했어요'
                : '아직 적어둔 할 일이 없어요\n편하게 적어두고 나중에 꺼내 보세요 🌱'}
            </Text>
          </View>
        ) : (
          <ReorderableList
            data={unpinnedMemos}
            keyExtractor={(item) => String(item.id)}
            onReorder={handleReorder}
            style={styles.scroll}
            contentContainerStyle={styles.reorderContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {error && <Text style={styles.errorText}>요청을 처리하지 못했어요</Text>}
                {pinnedMemos.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>즐겨찾기</Text>
                    {pinnedMemos.map((memo) => (
                      <MemoRow
                        key={memo.id}
                        memo={memo}
                        isEditing={editingId === memo.id}
                        {...memoRowHandlers}
                      />
                    ))}
                  </View>
                )}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>전체</Text>
                  {isAdding && renderInput()}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.reorderItem}>
                <DraggableMemoRow
                  memo={item}
                  isEditing={editingId === item.id}
                  {...memoRowHandlers}
                />
              </View>
            )}
          />
        )}
      </View>

      {!loading && !(isAdding && memos.length === 0) && (
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
  errorText: {
    ...typography.c1Caption,
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
  listHeader: {
    gap: 24,
  },
  reorderContent: {
    paddingBottom: 10,
  },
  reorderItem: {
    paddingHorizontal: 10,
    marginBottom: 8,
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
