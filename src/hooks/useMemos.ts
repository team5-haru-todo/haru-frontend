import { useCallback, useEffect, useState } from 'react';

import {
  changeTaskRecurring,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskOrder,
} from '@/src/api/task';
import type { TaskResponse, TaskType } from '@/src/api/task';

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

  const loadMemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await getTasks();
      setMemos(sortTasks(tasks));
    } catch (loadError) {
      console.error('메모 목록 조회 실패:', loadError);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
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

  // 한 섹션(RECURRING 또는 GENERAL)의 재정렬된 배열을 받아 서버에 저장한다.
  // displayOrder는 즐겨찾기(먼저) → 전체 순으로 0부터 다시 매긴다.
  const reorderMemosByType = useCallback(
    async (taskType: TaskType, reordered: TaskResponse[]) => {
      setError(null);
      const previous = memos;
      const pinned =
        taskType === 'RECURRING' ? reordered : memos.filter((memo) => memo.taskType === 'RECURRING');
      const unpinned =
        taskType === 'GENERAL' ? reordered : memos.filter((memo) => memo.taskType !== 'RECURRING');
      const merged = [...pinned, ...unpinned].map((memo, index) => ({
        ...memo,
        displayOrder: index,
      }));
      setMemos(merged); // 낙관적 반영
      try {
        await updateTaskOrder(
          merged.map((memo) => ({ taskId: memo.id, displayOrder: memo.displayOrder }))
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
    reorderMemosByType,
  };
}
