import { apiClient } from './client';

export type TaskType = 'GENERAL' | 'RECURRING';

export interface TaskResponse {
  id: number;
  content: string;
  taskType: TaskType;
  displayOrder: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TaskOrderItem {
  taskId: number;
  displayOrder: number;
}

export async function getTasks(): Promise<TaskResponse[]> {
  const response = await apiClient.get<ApiResponse<TaskResponse[]>>('/api/tasks');
  return response.data.data;
}

export async function createTask(
  content: string,
  taskType: TaskType = 'GENERAL'
): Promise<TaskResponse> {
  const response = await apiClient.post<ApiResponse<TaskResponse>>('/api/tasks', {
    content,
    taskType,
  });
  return response.data.data;
}

export async function updateTask(taskId: number, content: string): Promise<TaskResponse> {
  const response = await apiClient.patch<ApiResponse<TaskResponse>>(`/api/tasks/${taskId}`, {
    content,
  });
  return response.data.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`/api/tasks/${taskId}`);
}

export async function changeTaskRecurring(
  taskId: number,
  recurring: boolean
): Promise<TaskResponse> {
  const response = await apiClient.patch<ApiResponse<TaskResponse>>(
    `/api/tasks/${taskId}/recurring`,
    { recurring }
  );
  return response.data.data;
}

export async function updateTaskOrder(orders: TaskOrderItem[]): Promise<void> {
  await apiClient.patch<ApiResponse<void>>('/api/tasks/order', { orders });
}
