//apiClient : 백엔드 주소와 로그인 토큰을 자동으로 넣어주는 도구
import { apiClient } from './client';

export type TaskType = 'GENERAL' | 'RECURRING';
export type CompletionType = 'FIRST' | 'ADDITIONAL';

export interface CompletedTask {
  completionId: number;
  taskId: number;
  content: string;
  taskType: TaskType;
  completionType: CompletionType;
  completedAt: string;
}

export interface CalendarRecord {
  recordId: number;
  date: string;
  fireEarned: boolean;
  firstCompletedAt: string | null;
  completedTasks: CompletedTask[];
}

export async function getMonthlyCalendar(
  year: number,
  month: number,
): Promise<CalendarRecord[]> {
  const response = await apiClient.get('/api/calendar', {
    params: { year, month },
  });

  return response.data.data;
}
