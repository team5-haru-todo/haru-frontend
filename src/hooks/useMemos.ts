import { useCallback, useEffect, useState } from 'react';

import {
  changeTaskRecurring,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
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

  return {
    memos,
    loading,
    error,
    refreshMemos: loadMemos,
    addMemo,
    editMemo,
    removeMemo,
    toggleMemoRecurring,
  };
}
