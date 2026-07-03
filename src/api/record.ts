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

export interface TodayCurrentTask {
  id: number;
  content: string;
  taskType: TaskType;
}

export interface CompletionResponse {
  id: number;
  taskId: number;
  content: string;
  taskType: TaskType;
  completionType: 'FIRST' | 'ADDITIONAL';
  completedAt: string;
}

export interface TodayResponse {
  date: string;
  currentTask: TodayCurrentTask | null;
  fireEarned: boolean;
  firstCompletedAt: string | null;
  canFirstComplete: boolean;
  canAdditionalComplete: boolean;
  completedTasks: CompletionResponse[];
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

export interface StreakSummary {
  currentStreak: number;
  maxStreak: number;
  totalSuccessDays: number;
  lastSuccessDate: string | null;
}

export interface FirstCompleteResponse {
  date: string;
  completion: CompletionResponse;
  fireEarned: boolean;
  streak: StreakSummary;
}

// 새 할 일 생성과 동시에 오늘의 한 개로 설정 (record 도메인)
export async function createTodayTask(
  content: string,
  taskType?: TaskType
): Promise<TodayTaskSetResponse> {
  const response = await apiClient.post<ApiResponse<TodayTaskSetResponse>>('/api/today/task', {
    content,
    taskType,
  });
  return response.data.data;
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

// 오늘 날짜 기준 오늘의 한 개 상태와 완료 목록 조회 (record 도메인)
export async function getToday(): Promise<TodayResponse> {
  const response = await apiClient.get<ApiResponse<TodayResponse>>('/api/today');
  return response.data.data;
}

// 오늘의 한 개 첫 완료 처리 (record 도메인)
export async function completeToday(): Promise<FirstCompleteResponse> {
  const response = await apiClient.post<ApiResponse<FirstCompleteResponse>>('/api/today/complete');
  return response.data.data;
}

export interface AdditionalCompleteResponse {
  date: string;
  completion: CompletionResponse;
}

// 첫 완료 이후 다른 할 일을 추가로 완료 처리 (record 도메인, 스트릭에는 영향 없음)
export async function completeAdditional(taskId: number): Promise<AdditionalCompleteResponse> {
  const response = await apiClient.post<ApiResponse<AdditionalCompleteResponse>>(
    '/api/today/additional-complete',
    { taskId }
  );
  return response.data.data;
}
