import { apiClient } from './client';
import type { TaskType } from './task';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TodayTaskSetResponse {
  date: string;
  currentTask: {
    id: number;
    content: string;
    taskType: TaskType;
  } | null;
  currentTaskSelectedAt: string;
}

// 기존 할 일을 오늘의 한 개로 설정 (record 도메인)
export async function setTodayTask(taskId: number): Promise<TodayTaskSetResponse> {
  const response = await apiClient.patch<ApiResponse<TodayTaskSetResponse>>('/api/today/task', {
    taskId,
  });
  return response.data.data;
}
