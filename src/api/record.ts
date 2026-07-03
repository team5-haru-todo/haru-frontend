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

export interface DayCompletionResponse {
  date: string;
  dayOfWeek: string;
  completed: boolean;
}

export interface WeeklyStreakResponse {
  weekStartDate: string;
  todayDayIndex: number;
  currentStreak: number;
  days: DayCompletionResponse[];
}

// 기존 할 일을 오늘의 한 개로 설정 (record 도메인)
export async function setTodayTask(taskId: number): Promise<TodayTaskSetResponse> {
  const response = await apiClient.patch<ApiResponse<TodayTaskSetResponse>>('/api/today/task', {
    taskId,
  });
  return response.data.data;
}

// 이번 주(월~일, Asia/Seoul) 요일별 완료 여부와 현재 스트릭 조회 (record 도메인)
export async function getWeeklyStreak(): Promise<WeeklyStreakResponse> {
  const response = await apiClient.get<ApiResponse<WeeklyStreakResponse>>('/api/streak/week');
  return response.data.data;
}
