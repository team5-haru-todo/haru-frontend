import { useCallback, useEffect, useState } from 'react';

import {
  changeTaskRecurring,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskOrder,
} from '@/src/api/task';
import type { TaskResponse } from '@/src/api/task';

function sortTasks(tasks: TaskResponse[]) {
  return [...tasks].sort((a, b) => a.displayOrder - b.displayOrder);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return '요청에 실패했어요';
}

export function useMemos() {
  const [memos, setMemos] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // silent: 전체화면 로딩 스피너를 띄우지 않고 조용히 재조회 (pull-to-refresh, 포그라운드 복귀용)
  const loadMemos = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const tasks = await getTasks();
      setMemos(sortTasks(tasks));
      return true;
    } catch (loadError) {
      console.error('메모 목록 조회 실패:', loadError);
      setError(getErrorMessage(loadError));
      return false;
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const addMemo = useCallback(async (content: string) => {
    setError(null);
    try {
      const task = await createTask(content, 'GENERAL');
      setMemos((prev) => sortTasks([task, ...prev]));
      return true;
    } catch (createError) {
      console.error('메모 생성 실패:', createError);
      setError(getErrorMessage(createError));
      return false;
    }
  }, []);

  const editMemo = useCallback(async (taskId: number, content: string) => {
    setError(null);
    try {
      const task = await updateTask(taskId, content);
      setMemos((prev) => sortTasks(prev.map((memo) => (memo.id === taskId ? task : memo))));
      return true;
    } catch (updateError) {
      console.error('메모 수정 실패:', updateError);
      setError(getErrorMessage(updateError));
      return false;
    }
  }, []);

  const removeMemo = useCallback(async (taskId: number) => {
    setError(null);
    try {
      await deleteTask(taskId);
      setMemos((prev) => prev.filter((memo) => memo.id !== taskId));
      return true;
    } catch (deleteError) {
      console.error('메모 삭제 실패:', deleteError);
      setError(getErrorMessage(deleteError));
      return false;
    }
  }, []);

  const toggleMemoRecurring = useCallback(async (task: TaskResponse) => {
    setError(null);
    try {
      const updatedTask = await changeTaskRecurring(task.id, task.taskType !== 'RECURRING');
      setMemos((prev) => sortTasks(prev.map((memo) => (memo.id === task.id ? updatedTask : memo))));
      return true;
    } catch (recurringError) {
      console.error('메모 즐겨찾기 변경 실패:', recurringError);
      setError(getErrorMessage(recurringError));
      return false;
    }
  }, []);

  // 재정렬된 전체 메모 순서를 받아 저장한다. 섹션을 넘긴 항목이 있으면 pinChange로 핀(taskType)도 변경.
  // (ordered에는 각 메모의 새 taskType이 반영돼 있어야 하고, 즐겨찾기 먼저 순서는 호출부에서 보장한다)
  const reorderMemos = useCallback(
    async (ordered: TaskResponse[], pinChange?: { id: number; recurring: boolean }) => {
      const previous = memos;
      const reindexed = ordered.map((memo, index) => ({ ...memo, displayOrder: index }));
      // 낙관적 반영. 순서를 안 바꾼 되돌림 케이스에도 리스트를 원위치로 되돌리는 용도로 항상 세팅.
      setMemos(reindexed);
      const unchanged =
        !pinChange &&
        ordered.length === previous.length &&
        ordered.every(
          (memo, index) =>
            memo.id === previous[index].id && memo.taskType === previous[index].taskType
        );
      if (unchanged) {
        return true; // 순서·핀 그대로 → 서버 저장 생략
      }
      setError(null);
      try {
        if (pinChange) {
          await changeTaskRecurring(pinChange.id, pinChange.recurring);
        }
        await updateTaskOrder(
          reindexed.map((memo) => ({ taskId: memo.id, displayOrder: memo.displayOrder }))
        );
        return true;
      } catch (reorderError) {
        console.error('메모 순서 변경 실패:', reorderError);
        setMemos(previous); // 실패 시 롤백
        setError(getErrorMessage(reorderError));
        return false;
      }
    },
    [memos]
  );

  return {
    memos,
    loading,
    error,
    refreshMemos: loadMemos,
    addMemo,
    editMemo,
    removeMemo,
    toggleMemoRecurring,
    reorderMemos,
  };
}
