import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReorderableList, {
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
import { colors, layout, radius, spacing, typography } from '@/src/constants';

// 헤더/입력/메모를 하나의 드래그 리스트에 담기 위한 아이템 타입 (nesting 제거용)
type MemoListItem =
  | { type: 'header'; key: string; title: string; section: TaskResponse['taskType']; spaced: boolean }
  | { type: 'input'; key: string }
  | { type: 'memo'; key: string; memo: TaskResponse };

// 자정 롤오버 판단용 — KST 기준 YYYY-MM-DD (디바이스 로케일과 무관하게 KST 자정을 경계로).
function getKstDateKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

const ADD_BUTTON_HEIGHT = 54;
const ADD_BUTTON_VERTICAL_GAP = spacing.lg;
const ANDROID_MIN_BOTTOM_INSET = spacing.xl;
const LIST_BOTTOM_GAP = spacing.lg;

// 재정렬된 플랫 리스트를 훑어, 각 메모가 현재 어느 섹션에 속하는지 계산.
// 즐겨찾기 라벨은 리스트 밖(ListHeaderComponent) 고정이라 시작 섹션은 RECURRING,
// data에 남는 '전체' 헤더를 만나면 GENERAL로 전환 (문구가 아니라 header.section으로 판단).
function extractOrderedMemos(items: MemoListItem[]) {
  let currentSection: TaskResponse['taskType'] = 'RECURRING';
  const result: { memo: TaskResponse; section: TaskResponse['taskType'] }[] = [];
  for (const item of items) {
    if (item.type === 'header') {
      currentSection = item.section;
    } else if (item.type === 'memo') {
      result.push({ memo: item.memo, section: currentSection });
    }
  }
  return result;
}

function DraggableMemoRow(props: MemoCardProps) {
  const drag = useReorderableDrag();
  return <MemoCard {...props} onLongPress={drag} />;
}

export default function MemoListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? Math.max(insets.bottom, ANDROID_MIN_BOTTOM_INSET) : insets.bottom;
  const listBottomPadding = ADD_BUTTON_HEIGHT + ADD_BUTTON_VERTICAL_GAP + bottomInset + LIST_BOTTOM_GAP;
  const {
    memos,
    loading,
    error,
    addMemo,
    editMemo,
    removeMemo,
    toggleMemoRecurring,
    reorderMemos,
    refreshMemos,
  } = useMemos();
  const [isAdding, setIsAdding] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const memoSubmittingRef = useRef(false);
  const editSubmittingRef = useRef(false);
  // 마지막으로 목록을 조회한 KST 날짜와, 직전 AppState (자정 롤오버 감지용)
  const lastSyncedDateRef = useRef(getKstDateKey());
  const previousAppStateRef = useRef(AppState.currentState);

  // 당겨서 새로고침 — 완료(completedToday) 상태 등 최신 서버 값 반영. 전체화면 스피너 없이 조용히.
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const refreshed = await refreshMemos({ silent: true });
      if (refreshed) {
        lastSyncedDateRef.current = getKstDateKey();
      }
    } finally {
      setRefreshing(false);
    }
  }, [refreshMemos]);

  // 앱이 background/inactive에서 active로 복귀했을 때, 그 사이 KST 날짜가 바뀌었으면(자정 넘김)
  // 반복 할 일의 completedToday가 서버 기준으로 풀린 상태를 반영하기 위해 조용히 재조회한다.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const cameFromBackground = /inactive|background/.test(previousAppStateRef.current);
      if (cameFromBackground && nextAppState === 'active') {
        const currentDateKey = getKstDateKey();
        if (lastSyncedDateRef.current !== currentDateKey) {
          refreshMemos({ silent: true }).then((refreshed) => {
            if (refreshed) {
              lastSyncedDateRef.current = currentDateKey;
            }
          });
        }
      }
      previousAppStateRef.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [refreshMemos]);

  // 도전 = 이 할 일을 오늘의 한 개로 설정 (record 도메인) → 성공 시 메인으로 이동.
  // 메모장은 메인에서 push되므로 back()으로 복귀하며, 메인은 focus 시 syncTodayState로
  // 재조회하기 때문에 돌아가면 방금 설정한 '오늘의 한 개'가 반영된다.
  const handleChallenge = async (memo: TaskResponse) => {
    if (memo.completedToday) {
      return;
    }

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
    if (memoSubmittingRef.current) {
      return;
    }

    const content = memoText.trim();
    if (content.length === 0) {
      setMemoText('');
      setIsAdding(false);
      return;
    }

    memoSubmittingRef.current = true;
    try {
      const success = await addMemo(content);
      if (success) {
        setMemoText('');
        setIsAdding(false);
      }
    } finally {
      memoSubmittingRef.current = false;
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
      onBlur={handleSubmitMemo}
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
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.primary.default}
    />
  );

  // 즐겨찾기 라벨은 ListHeaderComponent(고정)로 빼고 카드만 data에 둔다.
  // 중간 '전체' 라벨만 셀로 남긴다 (섹션 경계 표시용).
  const listItems: MemoListItem[] = [];
  pinnedMemos.forEach((memo) => listItems.push({ type: 'memo', key: `memo-${memo.id}`, memo }));
  listItems.push({
    type: 'header',
    key: 'header-general',
    title: '전체',
    section: 'GENERAL',
    spaced: pinnedMemos.length > 0,
  });
  if (isAdding) {
    listItems.push({ type: 'input', key: 'input' });
  }
  unpinnedMemos.forEach((memo) => listItems.push({ type: 'memo', key: `memo-${memo.id}`, memo }));

  // 드래그: 섹션 넘김 = 핀 변경(RECURRING↔GENERAL). 즐겨찾기 라벨이 고정 헤더라 "무섹션" 케이스가 없어
  // 모든 드롭을 그대로 수용한다(거부/되돌림 없음 → stuck 없음).
  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    if (from === to) {
      return;
    }
    const reordered = [...listItems];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    if (moved.type !== 'memo') {
      return; // 헤더/입력은 드래그 핸들이 없어 실제로는 발생하지 않음
    }
    const orderedWithSection = extractOrderedMemos(reordered);
    const newOrdered = orderedWithSection.map((entry) => ({
      ...entry.memo,
      taskType: entry.section,
    }));
    const movedEntry = orderedWithSection.find((entry) => entry.memo.id === moved.memo.id);
    const pinChanged = movedEntry ? movedEntry.section !== moved.memo.taskType : false;
    reorderMemos(
      newOrdered,
      pinChanged && movedEntry
        ? { id: moved.memo.id, recurring: movedEntry.section === 'RECURRING' }
        : undefined
    );
  };

  const renderListItem = ({ item }: { item: MemoListItem }) => {
    if (item.type === 'header') {
      return (
        <Text style={[styles.sectionLabel, item.spaced && styles.sectionLabelSpaced]}>
          {item.title}
        </Text>
      );
    }
    if (item.type === 'input') {
      return <View style={styles.dragItem}>{renderInput()}</View>;
    }
    return (
      <View style={styles.dragItem}>
        <DraggableMemoRow
          memo={item.memo}
          isEditing={editingId === item.memo.id}
          {...memoRowHandlers}
        />
      </View>
    );
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
            data={listItems}
            keyExtractor={(item) => item.key}
            onReorder={handleReorder}
            renderItem={renderListItem}
            style={styles.scroll}
            contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            ListHeaderComponent={
              <>
                {error && <Text style={styles.errorText}>요청을 처리하지 못했어요</Text>}
                {pinnedMemos.length > 0 && <Text style={styles.sectionLabel}>즐겨찾기</Text>}
              </>
            }
          />
        )}
      </View>

      {!loading && !(isAdding && memos.length === 0) && (
        <View style={[styles.addButtonWrapper, { paddingBottom: bottomInset }]}>
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
    marginBottom: 8,
  },
  listWrapper: {
    width: '100%',
    padding: 10,
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    // Figma: Content_Area 좌우10 + 섹션 박스 padding10 = 20, 첫 라벨 위 = content pt16 + 섹션 pt10 = 26
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dragItem: {
    marginBottom: 8, // Figma: 섹션 내부 gap 8
  },
  sectionLabel: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
    marginBottom: 8, // Figma: 라벨 → 카드 gap 8
  },
  sectionLabelSpaced: {
    // Figma: 섹션 사이 = 섹션 pb10 + Content_Area gap24 + 섹션 pt10 = 44 (앞 카드 marginBottom 8 + 36)
    marginTop: 36,
  },
  input: {
    width: '100%',
    height: layout.memoInputHeight,
    borderWidth: 1,
    borderColor: colors.primary.default,
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 16,
    paddingVertical: 0,
    ...typography.b3BodyRegular,
    color: colors.text.primary,
    textAlignVertical: 'center',
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
    height: ADD_BUTTON_HEIGHT,
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
