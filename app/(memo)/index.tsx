import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  NestedReorderableList,
  ScrollViewContainer,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setTodayTask } from '@/src/api/record';
import type { TaskResponse } from '@/src/api/task';
import { DeleteMemoModal } from '@/src/components/memo/DeleteMemoModal';
import { MemoCard, type MemoCardProps } from '@/src/components/memo/MemoCard';
import { useMemos } from '@/src/hooks/useMemos';
import { useToastStore } from '@/src/store/toastStore';
import { colors, radius, spacing, typography } from '@/src/constants';

function DraggableMemoRow(props: MemoCardProps) {
  const drag = useReorderableDrag();
  return <MemoCard {...props} onLongPress={drag} />;
}

export default function MemoListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    memos,
    loading,
    error,
    addMemo,
    editMemo,
    removeMemo,
    toggleMemoRecurring,
    reorderMemosByType,
  } = useMemos();
  const [isAdding, setIsAdding] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const editSubmittingRef = useRef(false);

  // 도전 = 이 할 일을 오늘의 한 개로 설정 (record 도메인) → 성공 시 전역 토스트 + 메인으로 이동
  const handleChallenge = async (memo: TaskResponse) => {
    try {
      await setTodayTask(memo.id);
    } catch (challengeError) {
      console.error('오늘의 한 개 설정 실패:', challengeError);
      return;
    }
    useToastStore.getState().show('오늘의 한개로 설정했어요');
    router.back();
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

  const renderReorderableRow = ({ item }: { item: TaskResponse }) => (
    <View style={styles.dragItem}>
      <DraggableMemoRow memo={item} isEditing={editingId === item.id} {...memoRowHandlers} />
    </View>
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
          <ScrollViewContainer
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {error && <Text style={styles.errorText}>요청을 처리하지 못했어요</Text>}
            {pinnedMemos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>즐겨찾기</Text>
                <NestedReorderableList
                  data={pinnedMemos}
                  scrollable={false}
                  keyExtractor={(item) => String(item.id)}
                  onReorder={({ from, to }: ReorderableListReorderEvent) =>
                    reorderMemosByType('RECURRING', from, to)
                  }
                  renderItem={renderReorderableRow}
                />
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>전체</Text>
              {isAdding && renderInput()}
              <NestedReorderableList
                data={unpinnedMemos}
                scrollable={false}
                keyExtractor={(item) => String(item.id)}
                onReorder={({ from, to }: ReorderableListReorderEvent) =>
                  reorderMemosByType('GENERAL', from, to)
                }
                renderItem={renderReorderableRow}
              />
            </View>
          </ScrollViewContainer>
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

      <DeleteMemoModal
        visible={pendingDeleteId !== null}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
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
  scrollContent: {
    gap: 24,
    paddingBottom: 10,
  },
  dragItem: {
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
